import { Event } from 'nostr-tools';
import { useCallback, useEffect, useRef } from 'react';

import { useNostrStore } from './store';

import { Config } from './types';

import { generateSubId } from './utils';

export * from './types';
export * as utils from './utils';

export const useNostrSubscribe = ({ filters, relays, options }: Config) => {
  const subId = useRef(generateSubId());
  const shouldCreateSub = useRef(true);

  const handleSub = useNostrStore((store) => store.handleNewSub);
  const handleUnSub = useNostrStore((store) => store.unSub);
  const sub = useNostrStore((store) => store.subMap.get(subId.current));
  const { eose } = sub || {};
  const events = useNostrStore(
    useCallback(
      (store) => {
        const subscribedEvents = [] as Event[];
        store.eventMap.forEach((subIds, event) => {
          if (subIds.has(subId.current)) {
            subscribedEvents.push(event);
          }
        });

        return subscribedEvents;
      },
      [subId.current]
    )
  );

  useEffect(() => {
    if (options?.enabled === false) {
      shouldCreateSub.current = false;
      return;
    }

    if (options?.invalidate === true) {
      shouldCreateSub.current = true;
      return;
    }

    if (sub) {
      shouldCreateSub.current = false;
      return;
    }

    shouldCreateSub.current = true;
  }, [options?.enabled, options?.invalidate]);

  useEffect(() => {
    if (shouldCreateSub.current) {
      shouldCreateSub.current = false;
      handleSub({ filters, relays, options }, subId.current);
    }
  }, [shouldCreateSub.current, filters, relays, options, subId.current]);

  useEffect(() => {
    return () => {
      handleUnSub(subId.current);
    };
  }, [handleUnSub, subId.current]);

  return {
    events,
    eose,
  };
};

export const useNostrPublish = () => {
  //
};
