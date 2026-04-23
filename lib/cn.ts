import {twMerge} from '@/lib/tw-merge'

type ClassValue = string | false | null | undefined | ClassValue[]

function appendClasses(value: ClassValue, into: string[]) {
  if (!value) return

  if (typeof value === 'string') {
    into.push(value)
    return
  }

  for (const nested of value) {
    appendClasses(nested, into)
  }
}

export function cn(...inputs: ClassValue[]) {
  const classes: string[] = []

  for (const input of inputs) {
    appendClasses(input, classes)
  }

  return twMerge(classes.join(' '))
}
