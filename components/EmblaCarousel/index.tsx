import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { DotButton, PrevButton, NextButton } from './EmblaCarouselButtons'
import useEmblaCarousel, { EmblaOptionsType } from 'embla-carousel-react'
import { Thumb } from './EmblaCarouselThumb'
import { removeSlug } from 'functions/slug'
import Image from 'next/image'
import { HEADER_BG_IMG } from '@constants'
import { capitalizeText } from 'utils/functions/capitalize'
import { formattedPrice } from 'utils/functions/format'

const EmblaCarousel = ({ slides, media, smallView = false }: any) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)
  const [scrollSnaps, setScrollSnaps] = useState<any>([])

  const [mainViewportRef, emblaMainApi] = useEmblaCarousel({ skipSnaps: false })
  const [thumbViewportRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
    selectedClass: ''
  } as EmblaOptionsType)

  const scrollPrev = useCallback(
    () => emblaMainApi && emblaMainApi.scrollPrev(),
    [emblaMainApi]
  )
  const scrollNext = useCallback(
    () => emblaMainApi && emblaMainApi.scrollNext(),
    [emblaMainApi]
  )
  const scrollTo = useCallback(
    (index: number) => emblaMainApi && emblaMainApi.scrollTo(index),
    [emblaMainApi]
  )

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return
      emblaMainApi.scrollTo(index)
    },
    [emblaMainApi, emblaThumbsApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return
    setSelectedIndex(emblaMainApi.selectedScrollSnap())
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap())

    setPrevBtnEnabled(emblaMainApi.canScrollPrev())
    setNextBtnEnabled(emblaMainApi.canScrollNext())
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex])

  useEffect(() => {
    if (!emblaMainApi) return
    onSelect()
    setScrollSnaps(emblaMainApi.scrollSnapList())
    emblaMainApi.on('select', onSelect)
  }, [emblaMainApi, setScrollSnaps, onSelect])

  //get food id, image, name, price from the array of object
  const IdByIndex = (index: number) => media[index % media.length].foodId
  const priceByIndex = (index: number) => media[index % media.length].foodPrice
  const mediaByIndex = (index: number) => media[index % media.length].foodImgDisplayPath
  const nameByIndex = (index: number) => media[index % media.length].foodName

  return (
    <div dir={`ltr`}>
      {/* Big Menu View */}
      <div
        className={`w-full relative p-1 rounded-xl cursor-grab bg-center before:absolute before:bg-gray-100 before:dark:bg-gray-600 before:inset-0 before:bg-opacity-[.85] before:dark:bg-opacity-[.85] before:rounded-xl before:transition-colors`}
        style={{ backgroundImage: `url(${HEADER_BG_IMG})` }}
      >
        <div className='w-full overflow-hidden' ref={mainViewportRef}>
          <div className='flex -ml-2 select-none'>
            {slides.map((index: number) => (
              <Link
                href={`/view/item/${IdByIndex(index)}`}
                className='relative min-w-full pl-2'
                key={index}
              >
                {priceByIndex(index) && (
                  <span className='absolute z-40 flex items-center justify-center px-4 py-2 text-base font-bold text-white bg-green-900 sm:px-6 sm:text-xl rounded-xl top-3 left-4'>
                    {formattedPrice(priceByIndex(index))}
                  </span>
                )}
                <div
                  className={`relative overflow-hidden rounded-xl ${
                    smallView
                      ? slides.length > 1 //many images
                        ? 'h-[19.3rem]'
                        : 'h-[19.3rem] sm:[19.3rem] md:h-[19.3rem]'
                      : 'h-[19.3rem] sm:[19.3rem] md:h-96'
                  }`}
                >
                  <Image
                    className={`absolute z-30 block object-cover w-full min-h-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 hover:scale-110 transition-transform duration-200`}
                    src={mediaByIndex(index) || '/assets/img/icons/logo.svg'}
                    alt={removeSlug(capitalizeText(nameByIndex(index)))}
                    width={300}
                    height={300}
                  />
                </div>
                {!smallView && (
                  <span className='inline-block w-full py-2 text-base text-center sm:text-2xl'>
                    {removeSlug(capitalizeText(nameByIndex(index)))}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
        {slides.length > 1 && (
          <>
            <PrevButton onClick={scrollPrev} enabled={prevBtnEnabled} />
            <NextButton onClick={scrollNext} enabled={nextBtnEnabled} />
          </>
        )}
      </div>

      {/* Dots (buttons) View */}
      {!smallView && (
        <div className='flex justify-center pt-3 list-none'>
          {scrollSnaps.map((_: any, index: number) => (
            <DotButton
              key={index}
              selected={index === selectedIndex}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      )}

      {/* Thumb View */}
      {slides.length > 1 && (
        <div className='relative w-full p-2 transition-colors bg-gray-100 dark:bg-gray-600 rounded-xl'>
          <div className='w-full overflow-hidden' ref={thumbViewportRef}>
            <div className={`flex justify-between cursor-default select-none`}>
              {slides.map((index: number) => (
                <Thumb
                  onClick={() => onThumbClick(index)}
                  selected={index === selectedIndex}
                  imgSrc={mediaByIndex(index)}
                  alt={removeSlug(nameByIndex(index))}
                  key={index}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmblaCarousel
