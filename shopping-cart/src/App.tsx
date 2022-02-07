import { useState } from 'react';
import { useQuery } from 'react-query';
import Drawer from '@material-ui/core/Drawer';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import Badge from '@material-ui/core/Badge';
import Item from './Item/Item';
import Cart from './Cart/Cart';
import { Wrapper, StyledButton } from './App.styles';
import './App.css'

//types
export type CartItemType = {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;
  amount: number; //usado para verificar a qtd de itens no carrinho
}

const getProducts = async (): Promise<CartItemType[]> => 
  await(await fetch('https://fakestoreapi.com/products')).json();

const App = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([] as CartItemType[]);
  const {data, isLoading, error} = useQuery<CartItemType[]>('products', getProducts);
  console.log(data);

  //amount will be used to take the number of that product
  const getTotalItems = (items: CartItemType[]) => 
    items.reduce((ack: number, item) => ack + item.amount, 0);

  const handleAddToCart = (clickedItem: CartItemType) => {
    setCartItems(previous => {
      //already at the cart?
      const itemInCart = previous.find(item => item.id === clickedItem.id)
      if(itemInCart){
        return previous.map(item => 
          item.id === clickedItem.id ? 
          {...item, amount: item.amount + 1} :
          item
        );
      }
      //first time adding on the cart
      return [...previous, {...clickedItem, amount:1}];
    });
  };

  const handleRemoveFromCart = (id: number) => {
    setCartItems(previous => (
      previous.reduce((acumulator, item) => {
        if(item.id === id){
          if(item.amount === 1) return acumulator;
          return [...acumulator, {...item, amount: item.amount - 1}];
        }else{
          return [...acumulator, item];
        }
      }, [] as CartItemType[])
    ));
  };

  if(isLoading) return <LinearProgress/>;
  if(error) return <div>Erro ao recuperar os dados!</div>

  return (
    <Wrapper>
      <Drawer anchor='right'open={cartOpen} onClose={() => setCartOpen(false)}>
        <Cart cartItems={cartItems} addToCart={handleAddToCart} removeFromCart={handleRemoveFromCart}/>
      </Drawer>
      <StyledButton onClick={() => setCartOpen(true)}>
        <Badge badgeContent={getTotalItems(cartItems)} color='primary'>
          <AddShoppingCartIcon/>
        </Badge>
      </StyledButton>
      <Grid container spacing={3}>
        {data?.map(item => (
          <Grid item key={item.id} xs={12} sm={4}>
            <Item item={item} handleAddToCart={handleAddToCart}/>
          </Grid>
        ))}
      </Grid>
    </Wrapper>
  );
}

export default App;
