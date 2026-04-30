import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  onValueChange,
  ...props
}: SliderPrimitive.Root.Props & { onValueChange?: (value: number[]) => void }) {
  const values = value ?? defaultValue ?? [min, max]
  
  // Base UI uses onValueChange but the signature might differ
  // We wrap it to ensure it always returns an array for shadcn compatibility
  const handleValueChange: SliderPrimitive.Root.Props["onValueChange"] = (val) => {
    if (onValueChange) {
      onValueChange(Array.isArray(val) ? val : [val])
    }
  }

  return (
    <SliderPrimitive.Root
      className={cn("relative w-full flex items-center h-6 touch-none select-none", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      onValueChange={handleValueChange}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden"
      >
        <SliderPrimitive.Indicator
          data-slot="slider-range"
          className="absolute h-full bg-primary"
        />
      </SliderPrimitive.Track>
      {Array.isArray(values) ? (
        values.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            data-slot="slider-thumb"
            className="block h-4 w-4 rounded-full border-2 border-primary bg-background shadow-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 -ml-2"
          />
        ))
      ) : (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          className="block h-4 w-4 rounded-full border-2 border-primary bg-background shadow-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 -ml-2"
        />
      )}
    </SliderPrimitive.Root>
  )
}

export { Slider }
