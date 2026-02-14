
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend 
} from 'recharts';
import Sidebar from './components/Sidebar';
import TemperatureGauge from './components/TemperatureGauge';
import { 
  DashboardState, 
  FactoryType, 
  AnodeMaterial, 
  CathodeMaterial, 
  SeparatorType, 
  CasingMaterial,
  MaterialAvailability
} from './types';
import { FACTORY_LIMITS, PROCESS_STAGES, COMPONENT_DATA } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<DashboardState>({
    factoryType: FactoryType.MEDIUM,
    dailyUnits: 5000,
    automationLevel: 75,
    anodeMaterial: AnodeMaterial.GRAPHITE,
    cathodeMaterial: CathodeMaterial.NMC,
    separatorType: SeparatorType.POLYETHYLENE,
    casingMaterial: CasingMaterial.ALUMINIUM,
    currentProcessTemp: 80,
    operatingTemp: 25,
    materialAvailability: {
      Anode: true,
      Cathode: true,
      Electrolyte: true,
      Separator: true,
      'Current Collector': true,
      Casing: true
    }
  });

  // Derived metrics based on material availability
  const shortages = useMemo(() => {
    return (Object.keys(state.materialAvailability) as Array<keyof MaterialAvailability>)
      .filter(key => !state.materialAvailability[key]);
  }, [state.materialAvailability]);

  const hasShortages = shortages.length > 0;

  // Impact factors
  const capacityImpact = useMemo(() => {
    let factor = 1.0;
    if (!state.materialAvailability.Anode || !state.materialAvailability.Cathode) factor *= 0.3;
    else if (!state.materialAvailability.Separator || !state.materialAvailability.Electrolyte) factor *= 0.6;
    else if (shortages.length > 0) factor *= 0.85;
    return factor;
  }, [state.materialAvailability, shortages]);

  const timeImpact = useMemo(() => {
    let delay = 1.0;
    if (shortages.length > 0) delay += (shortages.length * 0.15); // 15% delay per missing material
    return delay;
  }, [shortages]);

  const effectiveUnits = Math.floor(state.dailyUnits * capacityImpact);

  // Calculate capacity comparison data
  const capacityData = useMemo(() => {
    return Object.entries(FACTORY_LIMITS).map(([key, value]) => ({
      name: key,
      min: value.min,
      max: value.max,
      current: state.factoryType === key ? effectiveUnits : 0,
      requested: state.factoryType === key ? state.dailyUnits : 0
    }));
  }, [state.factoryType, effectiveUnits, state.dailyUnits]);

  // Calculate timeline data based on automation and shortages
  const timelineData = useMemo(() => {
    const automationFactor = 1 - (state.automationLevel / 100) * 0.2; 
    return PROCESS_STAGES.map(stage => ({
      name: stage.name,
      value: Number((stage.durationMin * automationFactor * timeImpact).toFixed(1)),
      max: stage.durationMax,
      color: stage.color
    }));
  }, [state.automationLevel, timeImpact]);

  const totalCycleDays = timelineData.reduce((acc, curr) => acc + curr.value, 0);

  // Risk assessment
  const productionRisk = useMemo(() => {
    if (state.operatingTemp > 130) return 'CRITICAL';
    if (state.operatingTemp > 60 || hasShortages) return 'ELEVATED';
    return 'STABLE';
  }, [state.operatingTemp, hasShortages]);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-slate-50 overflow-hidden text-slate-900">
      <Sidebar state={state} setState={setState} />

      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Battery Manufacturing Dashboard</h1>
              <p className="text-slate-500 mt-1">Real-time production simulation and supply chain analytics</p>
            </div>
            <div className="flex gap-3">
               <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm flex items-center gap-3">
                <span className="text-xs font-semibold uppercase opacity-60">Cycle Time</span>
                <span className={`text-xl font-bold ${hasShortages ? 'text-amber-600' : 'text-blue-600'}`}>
                  {totalCycleDays.toFixed(1)} Days
                </span>
              </div>
              <div className={`${hasShortages ? 'bg-amber-600 animate-pulse' : 'bg-blue-600'} text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-3 transition-colors`}>
                <span className="text-xs font-semibold uppercase opacity-80">Efficiency</span>
                <span className="text-xl font-bold">{Math.round(capacityImpact * 100)}%</span>
              </div>
            </div>
          </div>
        </header>

        {/* Shortage Alerts */}
        {hasShortages && (
          <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-4 shadow-sm">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="font-bold text-amber-900">Supply Chain Constraints Detected</h3>
              <p className="text-sm text-amber-800">
                Shortage of <strong>{shortages.join(', ')}</strong> is impacting production throughput. 
                Output reduced by {Math.round((1 - capacityImpact) * 100)}% and cycle time increased.
              </p>
            </div>
          </div>
        )}

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Effective Capacity</p>
            <div className="flex items-baseline gap-2">
               <p className={`text-2xl font-bold ${hasShortages ? 'text-amber-600' : 'text-slate-800'}`}>{effectiveUnits.toLocaleString()}</p>
               {hasShortages && <p className="text-sm text-slate-400 line-through">/{state.dailyUnits.toLocaleString()}</p>}
            </div>
            <p className="text-xs text-slate-400 mt-2">Units per day</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Output Variance</p>
            <p className={`text-2xl font-bold ${hasShortages ? 'text-red-500' : 'text-slate-800'}`}>
              -{Math.round((1 - capacityImpact) * 100)}%
            </p>
            <p className="text-xs text-slate-400 mt-2">Vs Requested Capacity</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Production Risk</p>
            <p className={`text-2xl font-bold ${productionRisk === 'CRITICAL' ? 'text-red-600' : productionRisk === 'ELEVATED' ? 'text-amber-600' : 'text-green-600'}`}>
              {productionRisk}
            </p>
            <p className="text-xs text-slate-400 mt-2">System health factor</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Unit Delay</p>
            <p className="text-2xl font-bold text-slate-800">
              +{Math.round((timeImpact - 1) * 100)}%
            </p>
            <p className="text-xs text-slate-400 mt-2">Days per batch</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Capacity Benchmark</h3>
              <span className="text-xs text-slate-400">Log Scale (Units/Day)</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capacityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis scale="log" domain={[10, 2000000]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="requested" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Requested Units" />
                  <Bar dataKey="current" radius={[4, 4, 0, 0]} name="Effective Output">
                    {capacityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={state.factoryType === entry.name ? (hasShortages ? '#f59e0b' : '#3b82f6') : '#f1f5f9'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Process Timeline Breakdown</h3>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="h-64 w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={timelineData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {timelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-4">
                {timelineData.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-600">{item.name}</span>
                      <span className="font-bold text-slate-800">{item.value} Days</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full">
                       <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${(item.value / totalCycleDays) * 100}%`, backgroundColor: item.color }} 
                       />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Components & Temperature Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Material Status & Component Map</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {COMPONENT_DATA.map((comp, idx) => {
                let material = comp.material;
                if (comp.name === 'Anode') material = state.anodeMaterial;
                if (comp.name === 'Cathode') material = state.cathodeMaterial;
                if (comp.name === 'Separator') material = state.separatorType;
                if (comp.name === 'Casing') material = state.casingMaterial;

                const isAvailable = state.materialAvailability[comp.name as keyof MaterialAvailability];

                return (
                  <div key={idx} className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center text-center relative ${isAvailable ? 'bg-slate-50 border-slate-100' : 'bg-red-50 border-red-200 ring-2 ring-red-100'}`}>
                    {!isAvailable && (
                      <div className="absolute top-2 right-2 text-xs font-bold text-red-600 animate-pulse">
                        LOW
                      </div>
                    )}
                    <span className="text-2xl mb-2">{comp.icon}</span>
                    <span className={`text-xs font-bold uppercase mb-1 ${isAvailable ? 'text-slate-400' : 'text-red-400'}`}>{comp.name}</span>
                    <span className={`text-sm font-semibold ${isAvailable ? 'text-slate-800' : 'text-red-800'}`}>{material}</span>
                    {comp.collector && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full mt-2 font-bold uppercase ${state.materialAvailability['Current Collector'] ? 'bg-blue-100 text-blue-600' : 'bg-red-200 text-red-700'}`}>
                        Collector: {comp.collector}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <TemperatureGauge 
              label="Process Drying Phase" 
              value={state.currentProcessTemp} 
              min={0} 
              max={300} 
            />
            <TemperatureGauge 
              label="Active Operation Level" 
              value={state.operatingTemp} 
              min={0} 
              max={150} 
            />
            <div className={`p-6 rounded-2xl text-white shadow-lg transition-all duration-500 ${productionRisk === 'CRITICAL' ? 'bg-gradient-to-br from-red-600 to-red-900' : productionRisk === 'ELEVATED' ? 'bg-gradient-to-br from-amber-500 to-amber-800' : 'bg-gradient-to-br from-slate-800 to-slate-900'}`}>
              <h4 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4">System Integrity Status</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${state.operatingTemp > 130 ? 'bg-white shadow-[0_0_10px_white]' : state.operatingTemp > 60 || hasShortages ? 'bg-amber-300' : 'bg-green-500'}`} />
                  <span className="text-sm font-medium">
                    {state.operatingTemp > 130 ? 'CRITICAL SHUTDOWN IMMINENT' : hasShortages ? 'CONSTRAINED PERFORMANCE' : 'NOMINAL OPERATION'}
                  </span>
                </div>
                <div className="text-[10px] opacity-70 flex flex-col gap-1">
                  <div className="flex justify-between"><span>Normal Operation:</span><span>20-40°C</span></div>
                  <div className="flex justify-between"><span>Shortage Impact:</span><span>-{Math.round((1-capacityImpact)*100)}% Output</span></div>
                  <div className="flex justify-between"><span>Supply Chain Status:</span><span>{hasShortages ? 'RESTRICTED' : 'OPTIMAL'}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
