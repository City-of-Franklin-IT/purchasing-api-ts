import { Router } from "express"
import { getPurchases, getPurchase, createPurchase, updatePurchase, deletePurchase } from "@controllers/purchases"
import { entra } from "@middleware/auth"

const router = Router()

router.use(entra)

router
  .route('/')
  .get(getPurchases)
  .post(createPurchase)

router
  .route('/:uuid')
  .get(getPurchase)
  .put(updatePurchase)
  .delete(deletePurchase)

export default router