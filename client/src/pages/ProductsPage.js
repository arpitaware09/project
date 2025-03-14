import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import ProductCard from '../components/products/ProductCard';

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // State for products and loading
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(parseInt(queryParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  
  // State for filters
  const [filters, setFilters] = useState({
    category: queryParams.get('category') || '',
    platform: queryParams.get('platform') || '',
    minPrice: queryParams.get('minPrice') || '',
    maxPrice: queryParams.get('maxPrice') || '',
    search: queryParams.get('search') || '',
    sort: queryParams.get('sort') || 'newest'
  });
  
  // State for mobile filter visibility
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch products when filters or pagination changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query string from filters
        const params = new URLSearchParams();
        
        if (filters.category) params.append('category', filters.category);
        if (filters.platform) params.append('platform', filters.platform);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.search) params.append('search', filters.search);
        if (filters.sort) params.append('sort', filters.sort);
        
        params.append('page', currentPage);
        params.append('limit', 12);
        
        const res = await axios.get(`/api/products?${params.toString()}`);
        
        if (res.data.success) {
          setProducts(res.data.products);
          setTotalPages(res.data.totalPages);
          setCurrentPage(res.data.currentPage);
        }
      } catch (err) {
        setError('Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
    
    // Update URL with current filters
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.platform) params.append('platform', filters.platform);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);
    if (currentPage > 1) params.append('page', currentPage);
    
    navigate(`/products?${params.toString()}`, { replace: true });
  }, [filters, currentPage, navigate]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Handle search input
  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value
    });
  };
  
  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when search is submitted
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      platform: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: 'newest'
    });
    setCurrentPage(1);
  };
  
  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  // Toggle mobile filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  return (
    <ProductsContainer>
      <div className="container">
        <ProductsHeader>
          <h1>Browse Products</h1>
          <p>Find the perfect digital keys for your software needs</p>
        </ProductsHeader>
        
        <SearchForm onSubmit={handleSearchSubmit}>
          <SearchInput
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={handleSearchChange}
          />
          <SearchButton type="submit">
            <FaSearch />
          </SearchButton>
        </SearchForm>
        
        <MobileFilterToggle onClick={toggleFilters}>
          <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </MobileFilterToggle>
        
        <ProductsContent>
          <FilterSidebar className={showFilters ? 'show' : ''}>
            <FilterHeader>
              <h3>Filters</h3>
              <ClearFiltersButton onClick={clearFilters}>
                Clear All
              </ClearFiltersButton>
            </FilterHeader>
            
            <FilterGroup>
              <FilterLabel>Category</FilterLabel>
              <FilterSelect
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                <option value="esp-keys">ESP Keys</option>
                <option value="games">Games</option>
                <option value="software">Software</option>
                <option value="operating-systems">Operating Systems</option>
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Platform</FilterLabel>
              <FilterSelect
                name="platform"
                value={filters.platform}
                onChange={handleFilterChange}
              >
                <option value="">All Platforms</option>
                <option value="windows">Windows</option>
                <option value="mac">Mac</option>
                <option value="linux">Linux</option>
                <option value="android">Android</option>
                <option value="ios">iOS</option>
                <option value="cross-platform">Cross Platform</option>
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Price Range</FilterLabel>
              <PriceInputs>
                <PriceInput
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  min="0"
                />
                <PriceInput
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  min="0"
                />
              </PriceInputs>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Sort By</FilterLabel>
              <FilterSelect
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Rating</option>
              </FilterSelect>
            </FilterGroup>
            
            <CloseFiltersButton onClick={toggleFilters}>
              <FaTimes />
            </CloseFiltersButton>
          </FilterSidebar>
          
          <ProductsGrid>
            {loading ? (
              <LoadingMessage>Loading products...</LoadingMessage>
            ) : error ? (
              <ErrorMessage>{error}</ErrorMessage>
            ) : products.length === 0 ? (
              <NoProductsMessage>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search criteria</p>
                <ClearFiltersButton onClick={clearFilters}>
                  Clear All Filters
                </ClearFiltersButton>
              </NoProductsMessage>
            ) : (
              <>
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </>
            )}
          </ProductsGrid>
        </ProductsContent>
        
        {!loading && !error && products.length > 0 && (
          <Pagination>
            <PaginationButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </PaginationButton>
            
            <PageNumbers>
              {[...Array(totalPages).keys()].map(page => (
                <PageNumber
                  key={page + 1}
                  active={currentPage === page + 1}
                  onClick={() => handlePageChange(page + 1)}
                >
                  {page + 1}
                </PageNumber>
              ))}
            </PageNumbers>
            
            <PaginationButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </PaginationButton>
          </Pagination>
        )}
      </div>
    </ProductsContainer>
  );
};

const ProductsContainer = styled.div`
  padding: 2rem 0 4rem;
`;

const ProductsHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #666;
  }
`;

const SearchForm = styled.form`
  display: flex;
  max-width: 600px;
  margin: 0 auto 2rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-right: none;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SearchButton = styled.button`
  padding: 0.75rem 1.25rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: var(--secondary-color);
  }
`;

const MobileFilterToggle = styled.button`
  display: none;
  width: 100%;
  padding: 0.75rem;
  background-color: var(--light-color);
  color: var(--dark-color);
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1.5rem;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: 0.5rem;
  }
  
  @media (max-width: 992px) {
    display: flex;
  }
`;

const ProductsContent = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const FilterSidebar = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  height: fit-content;
  position: relative;
  
  @media (max-width: 992px) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    border-radius: 0;
    padding-top: 3rem;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    overflow-y: auto;
    
    &.show {
      transform: translateX(0);
    }
  }
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h3 {
    font-size: 1.25rem;
    margin: 0;
  }
`;

const ClearFiltersButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

const FilterGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const PriceInputs = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PriceInput = styled.input`
  width: 50%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const CloseFiltersButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #666;
  display: none;
  
  @media (max-width: 992px) {
    display: block;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingMessage = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: var(--light-text);
`;

const ErrorMessage = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: var(--danger-color);
`;

const NoProductsMessage = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--text-color);
  }
  
  p {
    color: var(--light-text);
    margin-bottom: 1.5rem;
  }
  
  button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 3rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #333333;
  border: 1px solid #444444;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--light-text);
  
  &:hover:not(:disabled) {
    background-color: var(--primary-color);
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageNumbers = styled.div`
  display: flex;
  margin: 0 1rem;
`;

const PageNumber = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #333333;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--card-background)'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  margin: 0 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--hover-background)'};
  }
`;

export default ProductsPage; 