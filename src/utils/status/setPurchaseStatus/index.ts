import { ErrorResponse } from "@utils/errorResponse"
import { Purchase, Reconciliation, Closed } from "@models/index"

// Types
import { NextFunction } from "express"
import { Model } from "sequelize"
import { PurchaseInterface, StatusEnum } from "@models/types"

export default async (uuid: string, next: NextFunction): Promise<Model<PurchaseInterface, PurchaseInterface> & PurchaseInterface|void> => {
  const purchase = await Purchase.findOne({
    where: {
      uuid
    },
    include: [
      { model: Reconciliation },
      { model: Closed }
    ]
  }) as Model<PurchaseInterface> & PurchaseInterface

  const newStatus = determinePurchaseStatus(purchase)

  const updated = await Purchase.update({
    status: newStatus
  },{
    where: {
      uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = updated

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update purchase by uuid ${ uuid }`, 500))
  }

  const data = (affectedRows as (Model<PurchaseInterface> & PurchaseInterface)[])[0]

  return data
}

const determinePurchaseStatus = (purchase: Model<PurchaseInterface> & PurchaseInterface): StatusEnum => {
  const { Reconciliation, Closed } = purchase

  if(Closed) { // Closed
    return StatusEnum.Closed
  }

  if(Reconciliation) { // Completed
    return StatusEnum.Completed
  }

  return StatusEnum.Purchased // Purchased
}