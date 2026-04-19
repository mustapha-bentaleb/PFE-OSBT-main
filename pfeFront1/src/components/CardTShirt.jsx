import Model from './Jersey';

export default function CardTShirt({ tshirt }) {

  return (
    <div style={{
      width: 350,
      height: 350,
      background: "#111",
      borderRadius: 12
    }}>
      <Model {...tshirt} />
    </div>
  );
}