import { useCallback, useState } from "react"
import { RequestByEmployeeParams, Transaction } from "../utils/types"
import { TransactionsByEmployeeResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function useTransactionsByEmployee(): TransactionsByEmployeeResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [transactionsByEmployee, setTransactionsByEmployee] = useState<Transaction[] | null>(null)

  const fetchById = useCallback(
    async (employeeId: string) => {
      const data = await fetchWithCache<Transaction[], RequestByEmployeeParams>(
        "transactionsByEmployee",
        {
          employeeId,
        }
      )
      //bug 7
      if (data === null) {
        return 
      }

      const updatedTransactions = data.map(newTransaction => {
        const existingTransaction = transactionsByEmployee?.find(t => t.id === newTransaction.id)
        if (existingTransaction) {
          return {
            ...newTransaction,
            approved: existingTransaction.approved
          }
        }
        return newTransaction
      })

      setTransactionsByEmployee(updatedTransactions)
    },
    [fetchWithCache, transactionsByEmployee]
  )

  const invalidateData = useCallback(() => {
    setTransactionsByEmployee(null)
  }, [])

  return { data: transactionsByEmployee, loading, fetchById, invalidateData }
}
