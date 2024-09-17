import { auth } from '@/app/auth';
import MapDraw from './mapDraw';
import TitleBar from '../../components/TitleBar/TitleBar';
export default async function Page({params}: { params: { slug: string } }) {
  const session = await auth();
  const TOKEN = process.env.MAPGL || ''; // Set your mapbox token here
  const { slug } = params
  return (
    <div className="app">
      <TitleBar title="Map Collab" />
      <div className="main-container">
        <MapDraw session={session} TOKEN={TOKEN} mapId={slug} />
      </div>

    </div>
  );
}