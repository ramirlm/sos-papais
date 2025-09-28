import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RemindersService } from '../../reminders/reminders.service';
import { WhatsappWebService } from '../../whatsapp-web/whatsapp-web.service';

@Injectable()
export class RemindersCronService {
  constructor(
    private readonly remindersService: RemindersService,
    private readonly whatsappWebService: WhatsappWebService,
  ) {}

  @Cron('0 0 0 * * *')
  async handleDailyReminders() {
    const reminders = await this.remindersService.findAll();

    for (let i = 0; i < reminders.length; i++) {
      if (i != 0 && i % 10 == 0) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
      const reminder = reminders[i];
      await this.whatsappWebService.sendWhatsAppMessage(
        reminder.parent.phoneNumber,
        `Lembrete: ${reminder.message} \n- Data: ${reminder.dueDate.toLocaleDateString('pt-BR')} \n- Hora: ${reminder.dueDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      );

      if (Date.now() >= new Date(reminder.dueDate).getTime()) {
        this.remindersService.remove(reminder);
      }
    }
  }
}
