import { Bot, InlineKeyboard } from 'grammy'

const token = process.env.TELEGRAM_BOT_TOKEN!
export const bot = new Bot(token)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://miss-burger.vercel.app'

bot.command('start', async (ctx) => {
  const keyboard = new InlineKeyboard().webApp('🍔 Открыть меню', APP_URL)
  await ctx.reply(
    `Добро пожаловать в *Miss Burger*! 🍔\n\nЛучшие бургеры Намангана ждут вас!\n\nНажмите кнопку ниже, чтобы открыть меню:`,
    { parse_mode: 'Markdown', reply_markup: keyboard }
  )
})

bot.command('menu', async (ctx) => {
  const keyboard = new InlineKeyboard().webApp('🍔 Открыть меню', APP_URL)
  await ctx.reply('Выберите блюдо из нашего меню:', { reply_markup: keyboard })
})

bot.command('orders', async (ctx) => {
  const keyboard = new InlineKeyboard().webApp('📦 Мои заказы', `${APP_URL}/orders`)
  await ctx.reply('Ваши заказы:', { reply_markup: keyboard })
})

bot.command('admin', async (ctx) => {
  const adminId = process.env.ADMIN_TELEGRAM_ID
  if (!adminId || ctx.from?.id.toString() !== adminId) {
    await ctx.reply('У вас нет доступа к этой команде.')
    return
  }
  const keyboard = new InlineKeyboard().webApp('⚙️ Админ панель', `${APP_URL}/admin`)
  await ctx.reply('Добро пожаловать в панель администратора:', { reply_markup: keyboard })
})

export async function sendOrderConfirmation(
  chatId: number,
  orderId: number,
  total: number,
  orderType: string
) {
  const typeLabel = orderType === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз'
  const totalStr = total.toLocaleString('ru-RU')
  const keyboard = new InlineKeyboard().webApp(
    '📦 Отследить заказ',
    `${APP_URL}/order/${orderId}`
  )
  await bot.api.sendMessage(
    chatId,
    `✅ *Заказ #${orderId} принят!*\n\n${typeLabel}\nСумма: *${totalStr} so'm*\n\nМы скоро начнём готовить ваш заказ.`,
    { parse_mode: 'Markdown', reply_markup: keyboard }
  )
}

export async function notifyAdminNewOrder(
  orderId: number,
  total: number,
  orderType: string,
  userName: string
) {
  const adminId = process.env.ADMIN_TELEGRAM_ID
  if (!adminId) return
  const typeLabel = orderType === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз'
  const totalStr = total.toLocaleString('ru-RU')
  await bot.api.sendMessage(
    parseInt(adminId),
    `🔔 *Новый заказ #${orderId}*\n\nКлиент: ${userName}\n${typeLabel}\nСумма: *${totalStr} so'm*`,
    { parse_mode: 'Markdown' }
  )
}
