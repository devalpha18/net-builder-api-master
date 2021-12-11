export const jwtConstant = {
  secret: 'secretKey',
  expiresIn: '3h',
};

export const verificationCodeExpiresIn = 30 * 60 * 1000; // in milliseconds

export const tronTransactionConfirmURL = 'https://apilist.tronscan.org/api/transaction-info?hash=';