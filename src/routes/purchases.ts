import { Router } from "express"
import { getPurchases, getPurchase, createPurchase, updatePurchase, deletePurchase } from "@controllers/purchases"
import { entra } from "@middleware/auth"
import { requireWrite } from "@utils/requireRole"

const router = Router()

router.use(entra)

router
  .route('/')
  .get(getPurchases)
  .post(requireWrite, createPurchase)

router
  .route('/:uuid')
  .get(getPurchase)
  .put(requireWrite, updatePurchase)
  .delete(requireWrite, deletePurchase)

export default router