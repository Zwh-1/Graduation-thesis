// --- 工具函数：计算 BMI ---
const calculateBMI = (height: number, weight: number) => {
  const hInMeters = height / 100;
  return (weight / (hInMeters * hInMeters));
};

// --- 常量定义 ---
const RULES = {
  minAge: 18,
  bmiMin: 18.5,
  bmiMax: 24.9
};
// --- 子组件：输入框 ---
interface InputGroupProps {
  label: string;
  name: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  min?: number;
  max?: number;
}

function InputGroup({ label, name, value, onChange, icon, min, max }: InputGroupProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-900 dark:text-slate-200 mb-1 flex items-center">
        <span className="mr-2 text-teal-500 dark:text-teal-400">{icon}</span>
        {label}
      </label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-900 dark:text-white font-mono text-sm"
      />
    </div>
  );
}
export default InputGroup;
export { calculateBMI, RULES };