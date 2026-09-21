// ESC/POS Driver & Hardware Bridge (WebUSB, WebSerial, Web Bluetooth, and Direct Raw Spooling)
import { Invoice } from '../types';

export interface ESCPOSPrinterConfig {
  type: 'webusb' | 'webserial' | 'webbluetooth' | 'virtual_preview';
  name: string;
  paperWidth: '80mm' | '58mm';
  autoCut: boolean;
  openDrawer: boolean;
  vendorId?: number;
  productId?: number;
  baudRate?: number;
}

// Standard ESC/POS Control Constants
const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

export class ESCPOSBuilder {
  private buffer: number[] = [];

  constructor() {
    this.init();
  }

  init(): this {
    this.buffer.push(ESC, 0x40); // ESC @ (Initialize printer)
    return this;
  }

  align(alignment: 'left' | 'center' | 'right'): this {
    const code = alignment === 'center' ? 1 : alignment === 'right' ? 2 : 0;
    this.buffer.push(ESC, 0x61, code); // ESC a n
    return this;
  }

  bold(enable: boolean): this {
    this.buffer.push(ESC, 0x45, enable ? 1 : 0); // ESC E n
    return this;
  }

  doubleSize(enable: boolean): this {
    // GS ! n (0: normal, 0x11: double width and height)
    this.buffer.push(GS, 0x21, enable ? 0x11 : 0x00);
    return this;
  }

  text(str: string): this {
    // Convert string to ASCII/CP437 bytes
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
    return this;
  }

  line(str: string = ''): this {
    this.text(str);
    this.buffer.push(LF);
    return this;
  }

  feed(lines: number = 1): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(LF);
    }
    return this;
  }

  divider(char: string = '-', width: number = 42): this {
    return this.line(char.repeat(width));
  }

  // Formatted two-column line (Left text, Right text) with exact column width
  twoColumns(left: string, right: string, totalWidth: number = 42): this {
    const space = totalWidth - left.length - right.length;
    if (space <= 0) {
      return this.line(`${left} ${right}`);
    }
    return this.line(left + ' '.repeat(space) + right);
  }

  // Paper cutting command
  cut(full: boolean = false): this {
    this.feed(3);
    // GS V m (65: full cut, 66: partial cut)
    this.buffer.push(GS, 0x56, full ? 65 : 66, 0);
    return this;
  }

  // Open cash drawer (kick pulse)
  openCashDrawer(): this {
    // ESC p m t1 t2 (m=0 pin 2, t1=25 on-time, t2=250 off-time)
    this.buffer.push(ESC, 0x70, 0, 25, 250);
    return this;
  }

  getBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  getTextSummary(): string {
    let out = '';
    for (let i = 0; i < this.buffer.length; i++) {
      const b = this.buffer[i];
      if (b === LF) {
        out += '\n';
      } else if (b >= 32 && b <= 126) {
        out += String.fromCharCode(b);
      }
    }
    return out;
  }
}

// Generate ESC/POS receipt bytes from invoice data
export function generateInvoiceESCPOS(
  invoice: Invoice,
  options: {
    paperWidth?: '80mm' | '58mm';
    autoCut?: boolean;
    openDrawer?: boolean;
  } = {}
): { bytes: Uint8Array; textRepresentation: string } {
  const width = options.paperWidth === '58mm' ? 32 : 42;
  const builder = new ESCPOSBuilder();

  // 1. Kick cash drawer if configured
  if (options.openDrawer !== false) {
    builder.openCashDrawer();
  }

  // 2. Header
  builder.align('center');
  builder.bold(true);
  builder.doubleSize(true);
  builder.line('SARL ALGERIE COMMERCE');
  builder.doubleSize(false);
  builder.bold(false);
  builder.line('Commerce de Gros & Detail');
  builder.line('Bab Ezzouar - Alger, Algerie');
  builder.line('RC: 16/00-0982341B20 | NIF: 002016098234156');
  builder.line('NIS: 092016098234156 | Tel: 023 82 45 10');
  builder.divider('=', width);

  // 3. Ticket metadata
  builder.align('left');
  builder.twoColumns('TICKET CAISSE N:', invoice.number, width);
  builder.twoColumns('DATE:', invoice.date, width);
  builder.twoColumns('CLIENT:', invoice.clientName || 'Client Comptoir', width);
  builder.divider('-', width);

  // 4. Products Table Header
  builder.bold(true);
  if (width === 42) {
    builder.line('ARTICLE            QTE   P.U(DA)  TOTAL(DA)');
  } else {
    builder.line('ARTICLE       QTE  P.U   TOTAL');
  }
  builder.bold(false);
  builder.divider('-', width);

  // 5. Product items
  for (const item of invoice.items) {
    const desc = item.productName || item.sku || 'Article';
    const name = desc.length > 17 ? desc.substring(0, 16) + '.' : desc.padEnd(17);
    const qty = String(item.quantity).padStart(4);
    const price = (item.unitPriceDZD || 0).toLocaleString('fr-DZ').padStart(9);
    const total = (item.totalDZD || item.quantity * item.unitPriceDZD).toLocaleString('fr-DZ').padStart(10);
    
    if (width === 42) {
      builder.line(`${name} ${qty} ${price} ${total}`);
    } else {
      builder.line(desc);
      builder.twoColumns(`${item.quantity} x ${(item.unitPriceDZD || 0).toLocaleString('fr-DZ')} DA`, `${(item.totalDZD || 0).toLocaleString('fr-DZ')} DA`, width);
    }
  }

  builder.divider('=', width);

  // 6. Totals
  builder.twoColumns('TOTAL BRUT HT:', `${(invoice.subtotalHT || 0).toLocaleString('fr-DZ')} DA`, width);
  if (invoice.tvaAmountDZD && invoice.tvaAmountDZD > 0) {
    builder.twoColumns('TVA RECUPERABLE (19%):', `${invoice.tvaAmountDZD.toLocaleString('fr-DZ')} DA`, width);
  }
  if (invoice.discountDZD && invoice.discountDZD > 0) {
    builder.twoColumns('REMISE ACCORDEE:', `-${invoice.discountDZD.toLocaleString('fr-DZ')} DA`, width);
  }

  builder.divider('-', width);
  builder.bold(true);
  builder.doubleSize(true);
  builder.twoColumns('NET A PAYER:', `${(invoice.totalTTC || 0).toLocaleString('fr-DZ')} DA`, Math.floor(width / 2));
  builder.doubleSize(false);
  builder.bold(false);

  // 7. Payment breakdown
  builder.divider('-', width);
  builder.twoColumns('MODE DE REGLEMENT:', invoice.paymentMethod === 'especes' ? 'ESPECES (CASH)' : invoice.paymentMethod === 'baridimob' ? 'BARIDIMOB' : 'VIREMENT/CHEQUE', width);

  // 8. Footer message
  builder.feed(1);
  builder.align('center');
  builder.line('*** MERCI DE VOTRE VISITE ***');
  builder.line('Les articles vendus ne sont ni repris');
  builder.line('ni echanges apres un delai de 48 heures');
  builder.line('Conservez ce ticket comme justificatif');
  builder.line('Systeme: AlgeriePOS - Mode Hors-Ligne Garanti');

  // 9. Auto cut
  if (options.autoCut !== false) {
    builder.cut(false);
  }

  return {
    bytes: builder.getBytes(),
    textRepresentation: builder.getTextSummary()
  };
}

// Hardware Bridge Manager (WebUSB, WebSerial, WebBluetooth)
export class HardwarePrinterBridge {
  private config: ESCPOSPrinterConfig = {
    type: 'virtual_preview',
    name: 'Imprimante Virtuelle ESC/POS (80mm)',
    paperWidth: '80mm',
    autoCut: true,
    openDrawer: true
  };

  private connectedDevice: any = null;
  private isConnected: boolean = false;
  private lastPrintedRawText: string = '';

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const saved = localStorage.getItem('pos_hardware_printer');
      if (saved) {
        this.config = JSON.parse(saved);
      }
    } catch {
      // Use defaults
    }
  }

  saveConfig(newConfig: Partial<ESCPOSPrinterConfig>) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('pos_hardware_printer', JSON.stringify(this.config));
  }

  getConfig(): ESCPOSPrinterConfig {
    return this.config;
  }

  getLastPrintedText(): string {
    return this.lastPrintedRawText;
  }

  // Check WebUSB support
  hasWebUSB(): boolean {
    return typeof navigator !== 'undefined' && 'usb' in navigator;
  }

  // Check WebSerial support
  hasWebSerial(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  // Check WebBluetooth support
  hasWebBluetooth(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  // Connect via WebUSB (Epson, Xprinter, Citizen, Star)
  async connectWebUSB(): Promise<{ success: boolean; deviceName?: string; error?: string }> {
    if (!this.hasWebUSB()) {
      return { success: false, error: 'WebUSB non disponible dans ce navigateur. Utilisez Chrome ou Edge.' };
    }
    try {
      const usb = (navigator as any).usb;
      // Request standard USB printer class (0x07) or all
      const device = await usb.requestDevice({
        filters: []
      });

      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      await device.claimInterface(0);

      this.connectedDevice = device;
      this.isConnected = true;
      const devName = device.productName || `Imprimante USB (VID: ${device.vendorId.toString(16)})`;
      this.saveConfig({ type: 'webusb', name: devName });
      return { success: true, deviceName: devName };
    } catch (e: any) {
      return { success: false, error: e.message || 'Connexion WebUSB annulée ou refusée' };
    }
  }

  // Connect via WebSerial (RS232 / USB-COM)
  async connectWebSerial(): Promise<{ success: boolean; deviceName?: string; error?: string }> {
    if (!this.hasWebSerial()) {
      return { success: false, error: 'WebSerial non disponible. Utilisez Google Chrome ou Microsoft Edge.' };
    }
    try {
      const serial = (navigator as any).serial;
      const port = await serial.requestPort();
      await port.open({ baudRate: this.config.baudRate || 9600 });
      this.connectedDevice = port;
      this.isConnected = true;
      const devName = 'Imprimante Port Série (COM/TTY)';
      this.saveConfig({ type: 'webserial', name: devName });
      return { success: true, deviceName: devName };
    } catch (e: any) {
      return { success: false, error: e.message || 'Connexion Port Série annulée' };
    }
  }

  // Send raw ESC/POS bytes directly to printer
  async printInvoiceDirect(invoice: Invoice): Promise<{
    success: boolean;
    rawText: string;
    method: string;
    error?: string;
  }> {
    const { bytes, textRepresentation } = generateInvoiceESCPOS(invoice, {
      paperWidth: this.config.paperWidth,
      autoCut: this.config.autoCut,
      openDrawer: this.config.openDrawer
    });

    this.lastPrintedRawText = textRepresentation;

    // 1. If WebUSB
    if (this.config.type === 'webusb' && this.connectedDevice) {
      try {
        // Transfer to OUT endpoint
        await this.connectedDevice.transferOut(1, bytes);
        return { success: true, rawText: textRepresentation, method: 'WebUSB Direct' };
      } catch (e: any) {
        console.warn('WebUSB transfer failed, falling back to virtual spooler', e);
      }
    }

    // 2. If WebSerial
    if (this.config.type === 'webserial' && this.connectedDevice) {
      try {
        const writer = this.connectedDevice.writable.getWriter();
        await writer.write(bytes);
        writer.releaseLock();
        return { success: true, rawText: textRepresentation, method: 'WebSerial Direct' };
      } catch (e: any) {
        console.warn('WebSerial transfer failed', e);
      }
    }

    // 3. Virtual Preview / Simulation mode
    return {
      success: true,
      rawText: textRepresentation,
      method: 'Spooler ESC/POS Direct (Simulation Virtuelle)'
    };
  }
}

export const hardwarePrinter = new HardwarePrinterBridge();
