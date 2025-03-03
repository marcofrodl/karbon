import consola from 'consola'
import fs from 'fs-extra'
import { fileTypeFromFile } from 'file-type'
import type { Tblock, Tlayout } from '../bundle/types'
import { extErrorMsg, karbonMsg, safeExt } from './setting'

interface TJson {
  layouts: Tlayout[]
  blocks: Tblock[]
}

let fileName = ''

function jsonSafe() {
  const data = fs.readFileSync(karbonMsg.jsonPosition, { encoding: 'utf-8' })
  const result = JSON.parse(data) as TJson
  const layoutExist = result.layouts.every((item) => fs.existsSync(`.storipress/${item.file}`))
  const blockExist = result.blocks.every(
    (item) =>
      (!item.ssr && fs.existsSync(`.storipress/${item.file}`)) ||
      (item.ssr && fs.existsSync(`.storipress/${item.file}`))
  )

  if (!layoutExist) {
    consola.error(karbonMsg.layoutsPosError)
    throw new Error(karbonMsg.uploadError)
  }
  if (!blockExist) {
    consola.error(karbonMsg.blocksPosError)
    throw new Error(karbonMsg.uploadError)
  }
  return layoutExist && blockExist
}

async function typeSafe() {
  const result = await fileTypeFromFile(fileName)
  if (result?.ext !== safeExt) {
    consola.error(extErrorMsg)
    throw new Error(karbonMsg.uploadError)
  }
}

export async function checkFile(siteTemplateName: string) {
  fileName = siteTemplateName
  await typeSafe()
  jsonSafe()
}
