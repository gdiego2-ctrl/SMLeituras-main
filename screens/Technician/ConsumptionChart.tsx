import React from 'react';
import { ConsumptionData } from '../../types';

interface ConsumptionChartProps {
  data: ConsumptionData[];
}

const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <span className="material-symbols-outlined text-5xl mb-2">bar_chart</span>
        <p className="text-sm font-bold">Sem dados de consumo disponíveis</p>
      </div>
    );
  }

  // Encontrar valor máximo para normalização
  const maxConsumption = Math.max(...data.map(d => d.consumoKwh), 1);

  return (
    <div className="space-y-4">
      {/* Chart container */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
        <div className="flex items-end justify-between gap-2 h-48">
          {data.map((item, index) => {
            const heightPercentage = (item.consumoKwh / maxConsumption) * 100;

            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                {/* Bar */}
                <div className="w-full flex flex-col justify-end flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-primary to-blue-400 rounded-t-lg transition-all duration-300 hover:opacity-80 relative group-hover:scale-105"
                    style={{ height: `${heightPercentage}%` }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-slate-900 text-white text-[10px] font-bold px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                        {item.consumoKwh.toFixed(0)} kWh
                        <div className="text-[9px] text-slate-300">
                          R$ {item.valorTotal.toFixed(2)}
                        </div>
                      </div>
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 mx-auto" />
                    </div>
                  </div>
                </div>

                {/* Label */}
                <div className="text-[9px] font-black uppercase text-slate-400 text-center leading-tight">
                  {item.monthLabel.split(' ')[0]}
                  <br />
                  <span className="text-[8px]">{item.monthLabel.split(' ')[1]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4 text-[10px]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-t from-primary to-blue-400 rounded" />
            <span className="font-bold text-slate-600 dark:text-slate-400">
              Consumo mensal (kWh)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionChart;
