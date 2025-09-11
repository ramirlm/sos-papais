import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { MessageHandlerService } from '../message-handler/message-handler.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappWebService implements OnModuleInit {
  private readonly numberSafelist: string[] = [];

  constructor(
    private readonly messageHandlerService: MessageHandlerService,
    private readonly configService: ConfigService,
  ) {
    const safelist = this.configService.getOrThrow<string>('NUMBER_SAFELIST');
    safelist.split(',').forEach((num: string) => {
      if (num) this.numberSafelist.push(num.trim());
    });
  }

  private readonly logger = new Logger(WhatsappWebService.name);
  private client: Client | null = null;

  async onModuleInit() {
    this.logger.log('Iniciando o WhatsApp Web Client...');

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'bot-session', // nome da sessão (pasta será criada)
      }),
      puppeteer: {
        headless: true, // ou false, se quiser ver o navegador
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });
    const client = this.client as Client;

    client.on('qr', (qr) => {
      this.logger.log('Escaneie o QR Code abaixo com seu WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
      this.logger.log('WhatsApp Web Client está pronto!');
    });

    client.on('auth_failure', (msg) => {
      this.logger.error('Falha na autenticação:', msg);
    });

    client.on('disconnected', (reason) => {
      this.logger.warn(`Cliente desconectado: ${reason}`);
    });

    client.on('message', (message) => {
      if (
        this.numberSafelist.length &&
        this.numberSafelist.indexOf(message.from) === -1
      )
        return this.logger.warn(`Número não autorizado: ${message.from}`);
      void this.messageHandlerService.handleIncomingMessage(message);
    });

    await client.initialize();
  }

  async sendWhatsAppMessage(to: string, message: string): Promise<void> {
    if (!this.client) {
      this.logger.warn('Cliente WhatsApp não está pronto.');
      return;
    }

    try {
      const phoneFormatted = this.formatPhoneNumber(to);
      await (this.client as Client).sendMessage(phoneFormatted, message);
      this.logger.log(`Mensagem enviada para ${to}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar mensagem para ${to}`, error);
    }
  }

  private formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    return `${cleanPhone}@c.us`;
  }
}
