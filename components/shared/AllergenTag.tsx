interface AllergenTagProps {
  allergen: string;
}

export function AllergenTag({ allergen }: AllergenTagProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-p2p-amber-light px-2.5 py-0.5 text-xs font-medium text-p2p-amber capitalize">
      {allergen}
    </span>
  );
}
