import React, { FC } from 'react';

import { useIntl } from 'react-intl';

import { Dialog } from '@onekeyhq/components';
import { OnCloseCallback } from '@onekeyhq/components/src/Dialog/components/FooterButton';
import { Wallet } from '@onekeyhq/engine/src/types/wallet';
import Protected from '@onekeyhq/kit/src/components/Protected';

import backgroundApiProxy from '../../../background/instance/backgroundApiProxy';
import { useActiveWalletAccount } from '../../../hooks/redux';
import { useToast } from '../../../hooks/useToast';
import { setRefreshTS } from '../../../store/reducers/settings';

type ManagerWalletDeleteDialogProps = {
  visible: boolean;
  wallet: Wallet | undefined;
  password: string | undefined;
  onDialogClose: () => void;
};

const ManagerWalletDeleteDialog: FC<ManagerWalletDeleteDialogProps> = ({
  visible,
  wallet,
  password,
  onDialogClose,
}) => {
  const intl = useIntl();
  const toast = useToast();
  const { wallet: activeWallet } = useActiveWalletAccount();
  const { dispatch, engine, serviceApp } = backgroundApiProxy;

  const { id: walletId, name } = wallet ?? {};
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <Dialog
      visible={visible}
      canceledOnTouchOutside={false}
      onClose={() => onDialogClose?.()}
      contentProps={{
        iconType: 'danger',
        title: intl.formatMessage({
          id: 'action__delete_wallet',
        }),
        content: intl.formatMessage({
          id: 'dialog__delete_wallet_desc',
        }),
      }}
      footerButtonProps={{
        primaryActionProps: {
          type: 'destructive',
          children: intl.formatMessage({ id: 'action__delete' }),
          isLoading,
        },
        onPrimaryActionPress: ({ onClose }: OnCloseCallback) => {
          if (!walletId) return;

          setIsLoading(true);

          engine
            .removeWallet(walletId, password ?? '')
            .then(async () => {
              if (activeWallet?.id === walletId) {
                await serviceApp.autoChangeWallet();
              }
              dispatch(setRefreshTS());
              toast.info(
                intl.formatMessage({ id: 'msg__wallet_deleted' }, { 0: name }),
              );
              onClose?.();
            })
            .catch((e) => {
              toast.info(intl.formatMessage({ id: 'msg__unknown_error' }));
              console.log(e);
            })
            .finally(() => {
              setIsLoading(false);
            });
        },
      }}
    />
  );
};

type ManagerWalletDeleteProps = {
  visible: boolean;
  wallet: Wallet | undefined;
  onDialogClose: () => void;
};

const ManagerWalletDelete: FC<ManagerWalletDeleteProps> = ({
  visible,
  wallet,
  onDialogClose,
}) =>
  visible ? (
    <Protected>
      {(password) => (
        <ManagerWalletDeleteDialog
          visible={visible}
          password={password}
          wallet={wallet}
          onDialogClose={onDialogClose}
        />
      )}
    </Protected>
  ) : null;

export default ManagerWalletDelete;
