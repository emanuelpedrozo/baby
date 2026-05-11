export function money(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency
  }).format(value);
}

export function date(value: string | Date) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}
