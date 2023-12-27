import { useContext, Suspense } from 'react'
import Link from 'next/link'
import useDocumentTitle from 'hooks/useDocumentTitle'
import abstractText from 'functions/abstractText'
import { removeSlug } from 'functions/slug'
import { CartContext } from 'contexts/CartContext'
import { SearchContext } from 'contexts/SearchContext'
import { LoadingCard } from 'components/Loading'
import Card from 'components/Card'
import Nav from 'components/Nav'
import Footer from 'components/Footer'
import Search from 'components/Search'
import { CartAddButton, CartRemoveButton } from 'components/CartButton'
import { capitalizeText } from 'utils/functions/capitalize'

const SearchResults: React.FC = () => {
  const { search, searchResults, loading } = useContext(SearchContext)
  const { items } = useContext(CartContext)

  useDocumentTitle(search ? `${search} نتائج البحث عن` : 'ابحث عن طعامك المفضل')

  const searchResultsCount = searchResults.length

  return (
    <section id='SearchResults' className='flex flex-col justify-between min-h-screen'>
      <Nav />
      <div className='container py-32 mx-auto mb-60'>
        <div className='text-center mb-28'>
          {search ? (
            <>
              <h2 className='mb-10 text-xl md:text-2xl xl:text-4xl'>
                نتائج البحث عن {search}
              </h2>
              <Search />
            </>
          ) : (
            <h2 className='mb-10 text-xl md:text-2xl xl:text-4xl'>
              ابحث عن منتجات، وجبات، مشروبات، أو حلويات...
            </h2>
          )}
        </div>

        {search ? (
          searchResultsCount > 0 ? (
            <div className='flex flex-col gap-y-36'>
              {searchResults?.map((data, idx) => (
                <Suspense key={idx} fallback={<LoadingCard />}>
                  <Card
                    cItemId={data._id}
                    cHeading={
                      <Link href={`/view/item/${data._id}`}>
                        {removeSlug(abstractText(capitalizeText(data.foodName), 70))}
                      </Link>
                    }
                    cPrice={data.foodPrice}
                    cCategory={data.category}
                    cDesc={abstractText(data.foodDesc, 120)}
                    cTags={data?.foodTags}
                    cToppings={data.foodToppings}
                    cImg={data.foodImgs}
                    cImgAlt={data.foodName}
                    cCtaLabel={
                      //add to cart button, if item is already in cart then disable the button
                      items.find(itemInCart => itemInCart.cItemId === data._id) ? (
                        <CartRemoveButton classes='bg-red-800 hover:bg-red-700'>
                          Remove From Cart
                        </CartRemoveButton>
                      ) : (
                        <CartAddButton classes='bg-green-800 hover:bg-green-700'>
                          Add To Cart
                        </CartAddButton>
                      )
                    }
                  />
                </Suspense>
              ))}
            </div>
          ) : loading ? (
            <LoadingCard />
          ) : (
            <h3 className='text-xl text-center md:text-2xl xl:text-4xl'>
              لا يوجد نتائج بحث عن {search}
            </h3>
          )
        ) : (
          <Search />
        )}
      </div>
      <Footer />
    </section>
  )
}

export default SearchResults
