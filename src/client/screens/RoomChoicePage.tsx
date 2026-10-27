import { CreateRoomForm } from "./CreateRoomForm";
import { JoinRoomForm } from "./JoinRoomForm";
import styles from "./Screens.module.css";

type Props = {
  readonly name: string;
  readonly onCreate: (size: 2 | 3 | 4) => void;
  readonly onJoin: (code: string) => void;
};

export function RoomChoicePage({ name, onCreate, onJoin }: Props) {
  return (
    <main className={styles["page"]}>
      <h1>Hello, {name}</h1>
      <CreateRoomForm onCreate={onCreate} />
      <JoinRoomForm onJoin={onJoin} />
    </main>
  );
}
