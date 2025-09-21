import { BarLoader } from 'react-spinners';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <BarLoader width={"100%"} color='#9333ea' />
    </div>
  );
}
