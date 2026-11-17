type Props = {
  readonly columns: ReadonlyArray<string>;
};

export function RecordTableHead({ columns }: Props) {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th key={column} scope="col">
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}
