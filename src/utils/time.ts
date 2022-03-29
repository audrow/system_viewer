import type {MessageEvent, Time} from '@foxglove/studio'

export function getTimeFromNumber(num: number): Time {
  const seconds = Math.floor(num)
  const nanoseconds = Math.floor((num - seconds) * 1_000_000_000)
  return {sec: seconds, nsec: nanoseconds} as Time
}

export function getFramesBeforeTime(
  frames: readonly MessageEvent<unknown>[] | undefined,
  time: Time,
) {
  const messages = frames?.filter((message) => compareTime(message.receiveTime, time) !== 1) ?? []
  return messages as MessageEvent<unknown>[]
}

export function compareTime(time1: Time, time2: Time) {
  if (time1.sec < time2.sec) {
    return -1
  } else if (time1.sec > time2.sec) {
    return 1
  } else {
    if (time1.nsec < time2.nsec) {
      return -1
    } else if (time1.nsec > time2.nsec) {
      return 1
    } else {
      return 0
    }
  }
}
