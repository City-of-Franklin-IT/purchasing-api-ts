import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Coding } from '@models/index'
import editorTracking from '@utils/editorTracking'

// Types
import { Request as Req, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { CodingInterface } from '@models/types'
import { ControllerResponse, CreateCodingRequest, CreateCodingResponse, UpdateCodingRequest, UpdateCodingResponse } from './types'

//@desc    Create Coding entry
//@route   POST /api/v2/dept-purchasing/coding
//@access  Private
export const createCode = asyncHandler(async (req: Req<{}, {}, CreateCodingRequest>, res: Response<CreateCodingResponse>) => {
  const { parentId, code } = req.body

  const result = await Coding.create({
    parentId,
    code,
    ...editorTracking(req)
  }) as Model<CodingInterface> & CodingInterface

  res.status(201).json({
    success: true,
    msg: 'Coding Created',
    data: result
  })
})

//@desc    Update Coding entry
//@route   PUT /api/v2/dept-purchasing/coding/:uuid
//@access  Private
export const updateCode = asyncHandler(async (req: Req<{ uuid: string }, {}, UpdateCodingRequest>, res: Response<UpdateCodingResponse>, next: NextFunction) => {
  const { code } = req.body

  const result = await Coding.update({
    code,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = result

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update code entry by uuid ${ req.params.uuid }`, 404))
  }

  const data = (affectedRows as (Model<CodingInterface> & CodingInterface)[])[0]

  res.status(200).json({
    success: true,
    msg: 'Coding Updated',
    data
  })
})

//@desc    Delete Coding entry
//@route   DELETE /api/v2/dept-purchasing/coding/:uuid
//@access  Private
export const deleteCode = asyncHandler(async (req: Req<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Coding.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete coding entry by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    msg: 'Coding Deleted'
  })
})