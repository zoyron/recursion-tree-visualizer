import { FunctionData } from './../../types'

export const codeValidate = (code: string) =>
  /^(function\s+fn\(.*\)\s+\{\n).*(\})$/s.test(code)

export const callValidate = (code: string) => /^(fn\(.*\))$/.test(code)

// fnData -> fnCode, fnCall, vars
export const ungroup = (fnData: FunctionData) => {
  const { params, body, variables } = fnData

  const paramsNames = params.map(({ name }) => name).join(',')
  const paramsValues = params.map(({ value }) => value).join(',')

  const var1 = variables && variables[0]
  const var2 = variables && variables[1]

  return {
    fnCode: `function fn(${paramsNames}) {\n${body}\n}`,
    fnCall: `fn(${paramsValues})`,
    vars: [
      { name: var1?.name || '', value: var1?.value || '' },
      { name: var2?.name || '', value: var2?.value || '' },
    ],
  }
}

// fnCode, fnCall, vars -> fnData
export const group = (
  fnCode: string,
  fnCall: string,
  vars: { name: string; value: string }[]
): FunctionData => {
  const paramsNames = betweenParentesis(fnCode)
  const paramsValues = betweenParentesis(fnCall)

  if (paramsNames.length !== paramsValues.length)
    throw new Error('Incorrect params values')

  const params = paramsNames.map((paramName, i) => ({
    name: paramName,
    value: paramsValues[i],
  }))
  const body = fnCode.substring(
    fnCode.indexOf('{') + 1,
    fnCode.lastIndexOf('}')
  )
  const variables = vars.filter(
    ({ name, value }) => name !== '' && value !== ''
  )

  return { params, body, variables }
}

const betweenParentesis = (str: string) =>
  str.substring(str.indexOf('(') + 1, str.indexOf(')')).split(',')
