export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
}

export const SUPPORTED_TOKENS: Token[] = [
  { 
    address: '0x81FeDE901c8415A412f3407f6cEDBCDDC89D888c', // Correct TEST token address from deployment
    symbol: 'TEST', 
    name: 'Test Token',
    decimals: 18,
    logo: '/tokens/test.png'
  }
];

export const getTokenByAddress = (address: string): Token | undefined => {
  return SUPPORTED_TOKENS.find(token => token.address.toLowerCase() === address.toLowerCase());
};

export const getTokenBySymbol = (symbol: string): Token | undefined => {
  return SUPPORTED_TOKENS.find(token => token.symbol.toLowerCase() === symbol.toLowerCase());
};
