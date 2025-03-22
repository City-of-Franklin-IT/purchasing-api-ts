import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { OPIQ } from '@models/index'

// Types
import { Request as Req, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { OPIQInterface } from '@models/types'
import { ControllerResponse, CreateOPIQRequest, CreateOPIQResponse, UpdateOPIQRequest, UpdateOPIQResponse } from './types'

//@desc    Create OPIQ entry
//@route   POST /api/v2/dept-purchasing/opiq
//@access  Private
export const createOPIQ = asyncHandler(async (req: Req<{}, {}, CreateOPIQRequest>, res: Response<CreateOPIQResponse>, next: NextFunction) => {
  const { parentId, opiqNum } = req.body

  const email = req.entra?.preferred_username

  const opiq = await OPIQ.create({
    parentId,
    opiqNum,
    createdBy: email,
    updatedBy: email
  }) as Model<OPIQInterface> & OPIQInterface

  if(!opiq) {
    return next(new ErrorResponse('Unable to create new OPIQ entry', 500))
  }

  res.status(201).json({
    success: true,
    msg: 'OpIQ Entry Created',
    data: opiq
  })
})

//@desc    Update OPIQ entry
//@route   PUT /api/v2/dept-purchasing/opiq/:uuid
//@access  Private
export const updateOPIQ = asyncHandler(async (req: Req<{ uuid: string }, {}, UpdateOPIQRequest>, res: Response<UpdateOPIQResponse>, next: NextFunction) => {
  const { opiqNum } = req.body

  const email = req.entra?.preferred_username

  const opiq = await OPIQ.update({
    opiqNum,
    updatedBy: email
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = opiq

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update OPIQ entry by uuid ${ req.params.uuid }`, 500))
  }

  const data = (affectedRows as (Model<OPIQInterface> & OPIQInterface)[])[0]

  res.status(200).json({
    success: true,
    msg: 'OpIQ Updated',
    data
  })
})

//@desc    Delete OPIQ entry
//@route   DELETE /api/v2/dept-purchasing/opiq/:uuid
//@access  Private
export const deleteOPIQ = asyncHandler(async (req: Req<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await OPIQ.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete OPIQ entry by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: 'OpIQ Deleted'
  })
})