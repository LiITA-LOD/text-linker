import { BarChart } from '@mui/x-charts/BarChart';
import React, { useMemo } from 'react';
import type { ConlluDocument } from '../../../utils/conllu';
import { getLiITACount } from '../../../utils/liita';

interface ProgressIndicatorProps {
  parsedData: ConlluDocument | null;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  parsedData,
}) => {
  const linkStats = useMemo(() => {
    if (!parsedData) {
      return { zeroLinks: 0, oneLink: 0, moreThanOneLink: 0, total: 0 };
    }

    let zeroLinks = 0;
    let oneLink = 0;
    let moreThanOneLink = 0;

    // Count links for all tokens across all sentences
    parsedData.sentences.forEach((sentence) => {
      sentence.tokens.forEach((token) => {
        const linkCount = getLiITACount(token);
        if (linkCount === 0) {
          zeroLinks++;
        } else if (linkCount === 1) {
          oneLink++;
        } else {
          moreThanOneLink++;
        }
      });
    });

    const total = zeroLinks + oneLink + moreThanOneLink;

    return { zeroLinks, oneLink, moreThanOneLink, total };
  }, [parsedData]);

  if (linkStats.total === 0) {
    return null;
  }

  // Prepare data for horizontal stacked bar chart
  const chartData = [
    {
      unlinked: linkStats.zeroLinks,
      linked: linkStats.oneLink,
      ambiguous: linkStats.moreThanOneLink,
    },
  ];

  return (
    <BarChart
      dataset={chartData}
      series={[
        {
          dataKey: 'unlinked',
          label: 'Unlinked',
          color: '#ff9800',
          stack: 'default',
        },
        {
          dataKey: 'linked',
          label: 'Linked',
          color: '#4caf50',
          stack: 'default',
        },
        {
          dataKey: 'ambiguous',
          label: 'Ambiguous',
          color: '#f44336',
          stack: 'default',
        },
      ]}
      layout="horizontal"
      height={50}
      hideLegend={true}
      margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
      yAxis={[{ position: 'none', data: ['Linking progress'] }]}
      xAxis={[{ position: 'none' }]}
    />
  );
};

export default ProgressIndicator;
