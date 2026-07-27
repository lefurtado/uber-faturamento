export type UserConfig = {
  valorLitroCombustivel: number;
  kmPorLitro: number;
  custoManutencaoDia: number;
  custoSeguroDia: number;
};

export type UserDoc = {
  config: UserConfig;
};
