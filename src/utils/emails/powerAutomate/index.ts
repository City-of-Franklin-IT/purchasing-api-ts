import logger from '@utils/logger'

export const triggerPowerAutomate = async (emailType: 'pending_approval' | 'purchase_submission' | 'status_change', id: string): Promise<void> => {
  const webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL

  if (!webhookUrl) {
    logger.error('POWER_AUTOMATE_WEBHOOK_URL is not set')
    return
  }

  const payload = {
    emailType,
    ...(emailType === 'purchase_submission' ? { purchaseId: id } : { requestId: id })
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      logger.error({ emailType, body: await response.text() }, 'Power Automate error')
    }
  } catch (error) {
    logger.error({ emailType, err: error }, 'Failed to trigger Power Automate')
  }
}
