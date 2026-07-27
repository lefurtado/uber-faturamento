export type AuthStackParamList = {
  Auth: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  Details: undefined;
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;
