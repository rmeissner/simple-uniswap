import React, { useCallback, useMemo, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Card, CardContent, CardHeader, CardActions, Button, Typography } from '@material-ui/core'
import TextFieldWithError from './TextFieldWithError'
import { ethers, BigNumber } from 'ethers'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { loadTokenInfo, loadTokenAllowance, TokenInfo, setAllowance } from '../logic/tokens'
import { uniswapContract } from '../logic/config'
import { swapTokens } from '../logic/uniswap'

declare global {
  interface Window { ethereum: any; }
}

const useStyles = makeStyles(() => ({
  card: {
    margin: "16px"
  },
  content: {
    display: "flex",
    flexDirection: "column"
  },
  input: {
    marginBottom: "8px"
  }
}));

interface Fields {
  sellToken?: string,
  buyToken?: string,
  tokenAmount?: string,
}

interface ValidatedInputs {
  sellToken?: TokenInfo,
  buyToken?: TokenInfo,
  tokenAmount?: BigNumber,
  needsApprove?: boolean
}

interface Trade {
  description: string,
  status: string
}

const Root = () => {
  const classes = useStyles();
  const [pendingTrade, setPendingTrade] = useState<Trade | undefined>(undefined)
  const [inputs, setInputs] = useState<Fields>({})
  const [errors, setErrors] = useState<Fields>({})
  const [validatedInputs, setValidatedInputs] = useState<ValidatedInputs>({})

  const provider = useMemo(() => {
    return new ethers.providers.Web3Provider(window.ethereum)
  }, [window.ethereum])

  const signer = useMemo(() => {
    return provider.getSigner()
  }, [provider])

  const validateInputs = useCallback(async (inputs) => {
    const errors: Fields = {}
    let sellToken: TokenInfo | undefined = undefined
    try {
      console.log(inputs.sellToken)
      sellToken = inputs.sellToken ? await loadTokenInfo(provider, inputs.sellToken) : undefined
    } catch (e) { errors.sellToken = e.message }

    let buyToken: TokenInfo | undefined = undefined
    try {
      buyToken = inputs.buyToken ? await loadTokenInfo(provider, inputs.buyToken) : undefined
    } catch (e) { errors.sellToken = e.message }

    let tokenAmount: BigNumber | undefined = undefined
    try {
      tokenAmount = inputs.tokenAmount ? parseUnits(inputs.tokenAmount, sellToken?.decimals || 0) : undefined
    } catch (e) { errors.tokenAmount = e.message }

    let needsApprove: boolean | undefined = undefined
    try {
      await window.ethereum.enable()
      const walletAddress = await signer.getAddress()
      needsApprove = !!tokenAmount &&
        !!sellToken &&
        tokenAmount.gt(await loadTokenAllowance(provider, inputs.sellToken, walletAddress, await uniswapContract(provider)))
    } catch (e) { console.error(e) }

    setErrors(errors)
    setValidatedInputs({ sellToken, buyToken, tokenAmount, needsApprove })
  }, [provider, signer, setErrors, setValidatedInputs])

  const approve = useCallback(async () => {
    if (!validatedInputs.sellToken || !validatedInputs.tokenAmount) return
    try {
      await setAllowance(signer, validatedInputs.sellToken.address, await uniswapContract(provider), validatedInputs.tokenAmount)
    } catch (e) {
      console.error(e)
    }
  }, [provider, signer, validatedInputs])

  const trade = useCallback(async () => {
    if (!validatedInputs.buyToken || !validatedInputs.sellToken || !validatedInputs.tokenAmount) return
    try {
      const description = `Swapping ${formatUnits(validatedInputs.tokenAmount, validatedInputs.sellToken.decimals)} ${validatedInputs.sellToken.symbol} for ${validatedInputs.buyToken.symbol}`
      setPendingTrade({
        description, status: "Signing"
      })
      const tx = await swapTokens(
        signer,
        provider,
        validatedInputs.sellToken.address,
        validatedInputs.buyToken.address,
        validatedInputs.tokenAmount
      )
      setPendingTrade({
        description, status: "Mining"
      })
      await tx.wait()
    } catch (e) {
      console.error(e)
    } finally {
      setPendingTrade(undefined)
    }
  }, [provider, validatedInputs, setPendingTrade])

  const updateSellToken = useCallback(async (input: string) => {
    const newInputs = { ...inputs, sellToken: input }
    setInputs(newInputs)
    validateInputs(newInputs)
  }, [inputs, setInputs, validateInputs])

  const updateBuyToken = useCallback(async (input: string) => {
    const newInputs = { ...inputs, buyToken: input }
    setInputs(newInputs)
    validateInputs(newInputs)
  }, [inputs, setInputs, validateInputs])

  const updateTokenAmount = useCallback(async (input: string) => {
    const newInputs = { ...inputs, tokenAmount: input }
    setInputs(newInputs)
    validateInputs(newInputs)
  }, [inputs, setInputs, validateInputs])

  return (
    <>
      { pendingTrade && (
        <Card className={classes.card}>
          <CardHeader title="Pending trade" />
          <CardContent className={classes.content}>
            <Typography>{pendingTrade.status} - {pendingTrade.description}</Typography>
          </CardContent>
        </Card>
      )}
      <Card className={classes.card}>
        <CardHeader title="Swap" />
        <CardContent className={classes.content}>
          <TextFieldWithError input={inputs.sellToken} error={errors.sellToken} className={classes.input} onChange={updateSellToken} label="Token to sell" />
          <TextFieldWithError input={inputs.buyToken} error={errors.buyToken} className={classes.input} onChange={updateBuyToken} label="Token to buy" />
          <TextFieldWithError input={inputs.tokenAmount} error={errors.tokenAmount} className={classes.input} onChange={updateTokenAmount} label="Amount to sell" />
        </CardContent>
        <CardActions>
          <Button size="small" color="primary" disabled={!validatedInputs.needsApprove} onClick={approve}>
            Approve
        </Button>
          <Button size="small" color="primary" disabled={!!pendingTrade || !validatedInputs.buyToken || !validatedInputs.sellToken || !validatedInputs.tokenAmount} onClick={trade}>
            Trade
        </Button>
        </CardActions>
      </Card>
    </>
  );
}

export default Root;
