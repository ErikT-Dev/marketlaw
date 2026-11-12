import { useEffect, useState } from "react";

const INCOME_NOTICE_MS = 3000;

export function useIncomeRiseNotice(income: number) {
  const [lastIncome, setLastIncome] = useState(income);
  const [riseCount, setRiseCount] = useState(0);
  const [isShown, setIsShown] = useState(false);
  if (income !== lastIncome) {
    setLastIncome(income);
    if (income > lastIncome) {
      setRiseCount(riseCount + 1);
      setIsShown(true);
    }
  }
  useEffect(() => {
    if (riseCount === 0) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setIsShown(false);
    }, INCOME_NOTICE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [riseCount]);
  return {
    isIncomeRiseShown: isShown,
    dismissIncomeRise: () => {
      setIsShown(false);
    },
  };
}
