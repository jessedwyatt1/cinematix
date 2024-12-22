export interface SessionInfo {
  // Transmission settings
  'transmission-url': string
  'transmission-port': number
  'transmission-username': string
  'transmission-password': string
  'transmission-secure': boolean
  
  // Speed limits
  'speed-limit-down-enabled': boolean
  'speed-limit-down': number
  'speed-limit-up-enabled': boolean
  'speed-limit-up': number
  'alt-speed-enabled': boolean
  'alt-speed-down': number
  'alt-speed-up': number
  'alt-speed-time-enabled': boolean
  'alt-speed-time-begin': number
  'alt-speed-time-end': number
  'alt-speed-time-day': number

  // Queue settings
  'download-queue-enabled': boolean
  'download-queue-size': number
  'seed-queue-enabled': boolean
  'seed-queue-size': number
  'queue-stalled-enabled': boolean
  'queue-stalled-minutes': number

  // Network settings
  'peer-port': number
  'peer-port-random-on-start': boolean
  'port-forwarding-enabled': boolean
  'dht-enabled': boolean
  'pex-enabled': boolean
  'lpd-enabled': boolean
  'utp-enabled': boolean

  // Storage settings
  'download-dir': string
  'rename-partial-files': boolean
  'cache-size-mb': number
  'incomplete-dir': string
  'incomplete-dir-enabled': boolean
  'start-added-torrents': boolean
  'port-is-open': boolean
  version: string
}