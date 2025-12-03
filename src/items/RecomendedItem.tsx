import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import {dish} from '../dish';

import {svg} from '../svg';
import {stores} from '../stores';
import {Routes} from '../routes';

import { ProductType } from '@/types/DishType';
import { hooks } from '@/hooks';

type Props = {
  item: ProductType;
};

export const RecommendedItem: React.FC<Props> = ({item}) => {
  // const {addToCart} = stores.useCartStore();
  const {updateWishlistWithItem} = hooks.useManageWishList()
  const {addToCart} = hooks.useManageCart()
  
  
  const {
    // list: wishlist,
    // addToWishlist,
    // removeFromWishlist,
  } = stores.useWishlistStore();

  // const dishId = item.id;

  // const ifInWishlist = wishlist.find((item) => item.id === dishId);

  return (
    <Link
      className='column clickable'
      href={`${Routes.MENU_ITEM}/${item.id}`}
      style={{
        backgroundColor: 'var(--white-color)',
        borderRadius: '10px',
        position: 'relative',
      }}
    >
      <Image
        src={item.image}
        alt='Dish'
        width={0}
        height={0}
        sizes='100vw'
        priority={true}
        style={{width: '100%', height: 'auto', borderRadius: '10px'}}
      />
      <button
        style={{
          position: 'absolute',
          right: 0,
          bottom: 72 - 15,
          padding: 15,
          borderRadius: 10,
        }}
        // onClick={(e) => {
        //   e.preventDefault();
        //   e.stopPropagation();
        //   addToWishlist(item);
        // }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          updateWishlistWithItem(item.id,item.variants[0].id)
        }}
      >
        <svg.HeartSvg flag={item.variants[0].is_favorite} />
      </button>
      <div
        className='column'
        style={{padding: '14px'}}
      >
        <dish.DishName
          name={item.name}
          style={{marginBottom: 3}}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <dish.DishPrice price={item.variants[0].sale_price} quantity={item.variants[0].quantity}/>
          <button
            style={{
              position: 'absolute',
              padding: '14px',
              right: 0,
              bottom: 0,
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Check if variant is out of stock before attempting to add
              if (item.variants[0].quantity === 0) {
                console.log('Cannot add to cart: Item is out of stock');
                return;
              }
              addToCart(item.id,item.variants[0].id)
            }}
          >
            <svg.PlusSvg />
          </button>
        </div>
      </div>
    </Link>
  );
};
