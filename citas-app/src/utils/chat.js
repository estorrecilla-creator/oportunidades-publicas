export function getChatId(uidA, uidB) {
  return [uidA, uidB].sort().join('_');
}
