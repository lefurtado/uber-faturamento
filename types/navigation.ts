export type AuthStackParamList = {
  Auth: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  Config: undefined;
  Fechamento: undefined;
  Details: undefined;
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;
