interface DietaryTagProps {
  tag: string;
}

export function DietaryTag({ tag }: DietaryTagProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-p2p-primary-light px-2.5 py-0.5 text-xs font-medium text-p2p-primary capitalize">
      {tag}
    </span>
  );
}
