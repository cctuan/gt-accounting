import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useState } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

function generateDistinctColors(count) {
  const colors = [];
  const saturation = 75;
  const lightness = 65;
  const hueStep = 360 / count;
  const hueOffset = Math.random() * 360;
  
  for (let i = 0; i < count; i++) {
    const hue = (hueOffset + i * hueStep) % 360;
    colors.push(`hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`);
  }
  
  return colors;
}

export default function BillChart({ billData }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 圓餅圖資料
  const chartData = {
    labels: billData.categories.map(cat => cat.name),
    datasets: [{
      data: billData.categories.map(cat => cat.amount),
      backgroundColor: generateDistinctColors(billData.categories.length),
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, index) => ({
              text: `${label} $${data.datasets[0].data[index].toLocaleString()}`,
              fillStyle: data.datasets[0].backgroundColor[index],
              index
            }));
          },
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `$${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    layout: {
      padding: 10
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 帳單基本資訊 */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {billData.bankName} {billData.cardType}
            </h3>
            <p className="text-sm text-gray-500">{billData.statementDate}</p>
          </div>
          <div className="text-xl font-semibold text-red-600">
            ${billData.totalAmount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 圓餅圖 */}
      <div className="p-4">
        <div className="h-64">
          <Pie data={chartData} options={options} />
        </div>
      </div>

      {/* 類別明細 */}
      <div className="p-4 border-t">
        <div className="space-y-4">
          {billData.categories.map((category) => (
            <div key={category.name} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setSelectedCategory(
                  selectedCategory === category.name ? null : category.name
                )}
                className="w-full px-4 py-2 flex items-center justify-between bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm text-gray-500">
                    ({category.percentage}%)
                  </span>
                </div>
                <span className="font-medium">
                  ${category.amount.toLocaleString()}
                </span>
              </button>
              
              {/* 類別細項 */}
              {selectedCategory === category.name && (
                <div className="divide-y">
                  {category.items.map((item, index) => (
                    <div key={index} className="px-4 py-2 bg-white">
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="text-gray-600">{item.date}</span>
                          <span className="ml-2">{item.description}</span>
                        </div>
                        <span>${item.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
