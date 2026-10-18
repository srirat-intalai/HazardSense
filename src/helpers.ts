import type { AlertLevel } from './types'

const disasterNames: Record<string, string> = {
  FL: 'น้ำท่วม',
  EQ: 'แผ่นดินไหว',
  TC: 'พายุหมุนเขตร้อน',
  WF: 'ไฟป่า',
  VO: 'ภูเขาไฟ',
  DR: 'ภัยแล้ง',
}

const disasterIcons: Record<string, string> = {
  FL: '🌊',
  EQ: '🌏',
  TC: '🌀',
  WF: '🔥',
  VO: '🌋',
  DR: '☀️',
}

export function typeName(type: string): string {
  return disasterNames[type] || type
}

export function typeIcon(type: string): string {
  return disasterIcons[type] || '⚠️'
}

export function alertText(level: AlertLevel): string {
  if (level === 'Red') {
    return 'แดง - ผลกระทบสูง'
  }

  if (level === 'Orange') {
    return 'ส้ม - ผลกระทบปานกลาง'
  }

  return 'เขียว - ผลกระทบต่ำ'
}

export function alertBadge(level: AlertLevel): string {
  if (level === 'Red') {
    return 'badge badge-error'
  }

  if (level === 'Orange') {
    return 'badge badge-warning'
  }

  return 'badge badge-success'
}

export function showDate(value: string): string {
  if (value === '') {
    return '-'
  }

  return value.replace('T', ' ').slice(0, 16) + ' UTC'
}

export function pmLevel(value: number | null): string {
  if (value === null) {
    return 'ไม่มีข้อมูล'
  }

  if (value <= 15) {
    return 'ดีมาก'
  }

  if (value <= 25) {
    return 'ดี'
  }

  if (value <= 37.5) {
    return 'ปานกลาง'
  }

  if (value <= 75) {
    return 'เริ่มมีผลกระทบต่อสุขภาพ'
  }

  return 'มีผลกระทบต่อสุขภาพ'
}

export function pmColor(value: number | null): string {
  if (value === null) {
    return 'bg-base-300'
  }

  if (value <= 15) {
    return 'bg-sky-400 text-white'
  }

  if (value <= 25) {
    return 'bg-green-500 text-white'
  }

  if (value <= 37.5) {
    return 'bg-yellow-300 text-gray-800'
  }

  if (value <= 75) {
    return 'bg-orange-500 text-white'
  }

  return 'bg-red-600 text-white'
}
