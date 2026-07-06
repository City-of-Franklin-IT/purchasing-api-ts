export const triggerPowerAutomate = async (emailType: 'pending_approval' | 'purchase_submission' | 'status_change', id: string): Promise<void> => {
  const webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL
  
  if (!webhookUrl) {
    console.error('POWER_AUTOMATE_WEBHOOK_URL is not set')
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
      console.error(`Power Automate error (${emailType}):`, await response.text())
    }
  } catch (error) {
    console.error(`Failed to trigger Power Automate (${emailType}):`, error)
  }
}
