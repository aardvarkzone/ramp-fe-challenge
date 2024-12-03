// import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
//bug 5: remove useState
import { Fragment, useCallback, useEffect, useMemo } from "react"

import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  //bug 5: remove useState
  // const [isLoading, setIsLoading] = useState(false)

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  const loadAllTransactions = useCallback(async () => {
    //bug 5: remove useState
    // setIsLoading(true)
    try {
      transactionsByEmployeeUtils.invalidateData()
      if (!employees) {
        await employeeUtils.fetchAll()
      }
      await paginatedTransactionsUtils.fetchAll()
    } catch (error) {
      console.error("Error loading transactions:", error)
    }
    //bug 5: remove useState
    // setIsLoading(false)
  }, [employeeUtils, employees, paginatedTransactionsUtils, transactionsByEmployeeUtils])


  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  const showViewMoreButton = useMemo(() => {
    return paginatedTransactions !== null && paginatedTransactions.nextPage !== null
  }, [paginatedTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />
        
        <InputSelect<Employee>
          //bug 5: remove useState
          // isLoading={isLoading}
          isLoading={employeeUtils.loading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          //bug 3: fix all employee selection
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }

            if (newValue === EMPTY_EMPLOYEE) {
              await loadAllTransactions()
              return 
            } else {
              await loadTransactionsByEmployee(newValue.id)
            }
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />
            
          {/* {transactions !== null && (
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading}
              onClick={async () => {
                //bug 4: view more fix
                await paginatedTransactionsUtils.fetchAll()
              }}
            >
              View More
            </button>
          )} */}
          {showViewMoreButton && ( /*bug 6*/
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading}
              onClick={async () => {
                await paginatedTransactionsUtils.fetchAll()
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}