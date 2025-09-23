import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';
import type React from 'react';
import { useMemo } from 'react';
import type { ConlluDocument } from '../../../utils/conllu';
import { getLinkedURIsCount } from '../../../utils/liita';

interface ProgressIndicatorProps {
  parsedData: ConlluDocument | null;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  parsedData,
}) => {
  const theme = useTheme();

  const linkStats = useMemo(() => {
    if (!parsedData) {
      return { zeroLinks: 0, oneLink: 0, moreThanOneLink: 0, other: 0 };
    }

    let zeroLinks = 0;
    let oneLink = 0;
    let moreThanOneLink = 0;
    let other = 0;

    // Count links for all tokens across all sentences
    parsedData.sentences.forEach((sentence) => {
      sentence.tokens.forEach((token) => {
        const isOther = token.id.includes('-') || token.upos == "PUNCT";

        if (isOther) {
          other++;
        } else {
          const linkCount = getLinkedURIsCount(token);
          if (linkCount === 0) {
            zeroLinks++;
          } else if (linkCount === 1) {
            oneLink++;
          } else {
            moreThanOneLink++;
          }
        }
      });
    });

    return { zeroLinks, oneLink, moreThanOneLink, other };
  }, [parsedData]);

  const total =
    linkStats.zeroLinks +
    linkStats.oneLink +
    linkStats.moreThanOneLink +
    linkStats.other;

  // Check if there are any tokens to display
  if (total === 0) {
    return null;
  }

  // Prepare data for horizontal stacked bar chart
  const chartData = [
    {
      unlinked: linkStats.zeroLinks,
      linked: linkStats.oneLink,
      ambiguous: linkStats.moreThanOneLink,
      other: linkStats.other,
    },
  ];

  return (
    <BarChart
      dataset={chartData}
      series={[
        {
          dataKey: 'unlinked',
          label: 'Unlinked',
          color: theme.palette.warning.main,
          stack: 'default',
        },
        {
          dataKey: 'linked',
          label: 'Linked',
          color: theme.palette.success.main,
          stack: 'default',
        },
        {
          dataKey: 'ambiguous',
          label: 'Ambiguous',
          color: theme.palette.error.main,
          stack: 'default',
        },
        {
          dataKey: 'other',
          label: 'Other',
          color: theme.palette.action.disabled,
          stack: 'default',
        },
      ]}
      layout="horizontal"
      height={50}
      hideLegend={true}
      margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
      yAxis={[{ position: 'none', data: ['Linking progress'] }]}
      xAxis={[
        {
          position: 'none',
          min: 0,
          max: total,
        },
      ]}
    />
  );
};

export default ProgressIndicator;
