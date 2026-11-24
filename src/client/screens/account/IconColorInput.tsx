import styles from "./IconPicker.module.css";

type Props = {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
};

export function IconColorInput({ label, value, onChange }: Props) {
  return (
    <label className={styles["color"]}>
      {label}
      <input
        type="color"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </label>
  );
}
