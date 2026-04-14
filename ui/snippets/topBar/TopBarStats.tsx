import { Flex, chakra } from '@chakra-ui/react';
import React from 'react';

import type { GasPriceInfo } from 'types/api/stats';

import config from 'configs/app';
import useApiQuery from 'lib/api/useApiQuery';
import dayjs from 'lib/date/dayjs';
import useIsMobile from 'lib/hooks/useIsMobile';
import { HOMEPAGE_STATS } from 'stubs/stats';
import { Link } from 'toolkit/chakra/link';
import { Skeleton } from 'toolkit/chakra/skeleton';
import GasInfoTooltip from 'ui/shared/gas/GasInfoTooltip';
import GasPrice from 'ui/shared/gas/GasPrice';
import TextSeparator from 'ui/shared/TextSeparator';

import GetGasButton from './GetGasButton';

// When the backend doesn't provide a USD fiat_price for gas (e.g. no CoinGecko integration),
// compute it from the gwei price × coin price × 21,000 (standard transfer gas units).
function enrichGasWithFiatPrice(gas: GasPriceInfo | null, coinPrice: string | null): GasPriceInfo | null {
  if (!gas || gas.fiat_price !== null || !gas.price || !coinPrice) {
    return gas;
  }
  const fiat = Number(gas.price) * 1e-9 * 21_000 * Number(coinPrice);
  return { ...gas, fiat_price: fiat.toString() };
}

const TopBarStats = () => {
  const isMobile = useIsMobile();

  const { data, isPlaceholderData, isError, refetch, dataUpdatedAt } = useApiQuery('general:stats', {
    queryOptions: {
      placeholderData: HOMEPAGE_STATS,
      refetchOnMount: false,
    },
  });

  React.useEffect(() => {
    if (isPlaceholderData || !data?.gas_price_updated_at) {
      return;
    }

    const endDate = dayjs(dataUpdatedAt).add(data.gas_prices_update_in, 'ms');
    const timeout = endDate.diff(dayjs(), 'ms');

    if (timeout <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      refetch();
    }, timeout);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [ isPlaceholderData, data?.gas_price_updated_at, dataUpdatedAt, data?.gas_prices_update_in, refetch ]);

  if (isError) {
    return <div/>;
  }

  // Enrich gas prices with a computed USD fiat_price when the backend doesn't supply one.
  const coinPrice = data?.coin_price ?? null;
  const enrichedGasPrices = data?.gas_prices ? {
    average: enrichGasWithFiatPrice(data.gas_prices.average, coinPrice),
    fast: enrichGasWithFiatPrice(data.gas_prices.fast, coinPrice),
    slow: enrichGasWithFiatPrice(data.gas_prices.slow, coinPrice),
  } : null;
  const enrichedData = data && enrichedGasPrices ? { ...data, gas_prices: enrichedGasPrices } : data;

  const hasNativeCoinPrice = data?.coin_price && !config.UI.nativeCoinPrice.isHidden;
  const hasSecondaryCoinPrice = data?.secondary_coin_price && config.chain.secondaryCoin.symbol && (hasNativeCoinPrice ? !isMobile : true);
  const hasGasInfo = enrichedGasPrices && enrichedGasPrices.average !== null && config.features.gasTracker.isEnabled && !isMobile;

  return (
    <>
      { Boolean(config.UI.featuredNetworks.items) && <TextSeparator/> }
      <Flex
        alignItems="center"
        fontWeight={ 500 }
      >
        { hasNativeCoinPrice && (
          <Flex columnGap={ 1 }>
            <Skeleton loading={ isPlaceholderData }>
              <chakra.span color="text.secondary">{ config.chain.currency.symbol } </chakra.span>
              <span>${ Number(data.coin_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) }</span>
            </Skeleton>
            { data.coin_price_change_percentage && !(isMobile && Boolean(config.UI.featuredNetworks.items)) && (
              <Skeleton loading={ isPlaceholderData }>
                <chakra.span color={ Number(data.coin_price_change_percentage) >= 0 ? 'green.500' : 'red.500' }>
                  { Number(data.coin_price_change_percentage).toFixed(2) }%
                </chakra.span>
              </Skeleton>
            ) }
          </Flex>
        ) }
        { hasSecondaryCoinPrice && (
          <Flex columnGap={ 1 } ml={ data?.coin_price ? 3 : 0 }>
            <Skeleton loading={ isPlaceholderData }>
              <chakra.span color="text.secondary">{ config.chain.secondaryCoin.symbol } </chakra.span>
              <span>${ Number(data.secondary_coin_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) }</span>
            </Skeleton>
          </Flex>
        ) }
        { (hasNativeCoinPrice || hasSecondaryCoinPrice) && hasGasInfo && <TextSeparator/> }
        { hasGasInfo && enrichedData && (
          <>
            <Skeleton loading={ isPlaceholderData } whiteSpace="pre-wrap">
              <chakra.span color="text.secondary">Gas </chakra.span>
              <GasInfoTooltip data={ enrichedData } dataUpdatedAt={ dataUpdatedAt } placement={ !data?.coin_price ? 'bottom-start' : undefined }>
                <Link>
                  <GasPrice data={ enrichedGasPrices?.average ?? null }/>
                </Link>
              </GasInfoTooltip>
            </Skeleton>
            { !isPlaceholderData && <GetGasButton/> }
          </>
        ) }
      </Flex>
    </>
  );
};

export default React.memo(TopBarStats);
