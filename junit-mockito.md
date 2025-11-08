# JUnit & Mockito Interview Guide

---

## 1. Testing Strategy & Pyramid Fundamentals

### Concept Brief

Testing pyramids emphasize many fast unit tests, fewer integration tests, and a slim E2E layer. Balance coverage, speed, and confidence while aligning with continuous delivery.

### Why It Matters

- **Velocity**: Fast feedback keeps Bhopal squads shipping daily.
- **Confidence**: Layered tests catch regressions early.
- **Cost Control**: Prevent brittle E2E explosions and long pipelines.

### Practical Walkthrough

```text
          UI / E2E  (Selenium, Cypress, Playwright)
        Integration (SpringBootTest, Testcontainers)
Unit / Component (JUnit 5, Mockito, WireMock, AssertJ)
```

### Follow-Up Questions

- How do you decide when a test should be unit vs integration vs E2E?
- What metrics track the health of the pyramid (runtime, flake rate)?
- How do you incorporate exploratory or chaos testing alongside the pyramid?

---

## 2. JUnit 5 Essentials & Parameterized Tests

### Concept Brief

JUnit Jupiter brings expressive annotations (`@Test`, `@DisplayName`, `@Nested`, `@ParameterizedTest`) and lifecycle hooks for deterministic tests.

### Why It Matters

- **Coverage**: Exercise Bhopal business rules across varied data.
- **Readability**: Descriptive names document intent for reports.
- **Isolation**: Lifecycle hooks keep state predictable.

### Practical Walkthrough

```java
@DisplayName("Bhopal tax calculation scenarios")
class TaxCalculatorTest {

    @BeforeEach
    void setup() {
        taxCalculator = new TaxCalculator();
    }

    @ParameterizedTest(name = "[{index}] amount={0}, slab={1}")
    @CsvSource({
        "1000, STANDARD, 50",
        "75000, PREMIUM, 5625",
        "125000, ENTERPRISE, 10000"
    })
    void shouldCalculateTax(BigDecimal amount, TaxSlab slab, BigDecimal expected) {
        BigDecimal actual = taxCalculator.calculate(amount, slab, "Bhopal");
        assertEquals(expected, actual);
    }

    @Nested
    @DisplayName("Refund validations")
    class Refunds {
        @Test
        void shouldRejectRefundWhenPastWindow() {}
    }
}
```

### Follow-Up Questions

- When do you use `@MethodSource` vs `@CsvSource`?
- How do you share expensive setup between nested test classes?
- What role do test interfaces (`@TestInstance`) play in resource-heavy suites?

---

## 3. Assertions, Matchers & Fluent APIs

### Concept Brief

Assertion libraries (JUnit Jupiter `Assertions`, AssertJ, Hamcrest) offer expressive failure messages and custom matchers for domain data.

### Why It Matters

- **Signal**: Clear failures speed triage for Bhopal support rotations.
- **Expressiveness**: Fluent assertions mirror business language.
- **Extensibility**: Custom matchers encapsulate repeated logic.

### Practical Walkthrough

```java
import static org.assertj.core.api.Assertions.assertThat;

@Test
void shouldReturnSortedOrders() {
    List<OrderSummary> summaries = service.fetchOrders("Bhopal");

    assertThat(summaries)
        .hasSizeGreaterThanOrEqualTo(1)
        .allMatch(summary -> summary.region().equals("Bhopal"))
        .isSortedAccordingTo(Comparator.comparing(OrderSummary::createdAt).reversed());
}
```

### Follow-Up Questions

- When do you build custom AssertJ assertions vs helper methods?
- How do you integrate JSON assertions (JSONAssert, assertj-json)?
- What is the trade-off between Hamcrest matchers and AssertJ fluent APIs?

---

## 4. Mockito Advanced Usage (Spies, Captors, Inline Mocking)

### Concept Brief

Mockito supports mocks, spies, argument captors, inline mocking of final/static methods, and strict stubbing for safer tests.

### Why It Matters

- **Precision**: Verify Kafka payloads for Bhopal billing flows.
- **Legacy Support**: Inline mocks cover final classes without refactor.
- **Safety**: Strict stubs catch unused expectations early.

### Practical Walkthrough

```java
@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock private KafkaTemplate<String, BillingEvent> kafkaTemplate;
    @InjectMocks private BillingService billingService;
    @Captor private ArgumentCaptor<BillingEvent> eventCaptor;

    @Test
    void shouldPublishBillingEvent() {
        billingService.bill(order);

        verify(kafkaTemplate).send(eq("bhopal-billing"), eventCaptor.capture());
        BillingEvent event = eventCaptor.getValue();
        assertEquals("Bhopal", event.region());
        verifyNoMoreInteractions(kafkaTemplate);
    }
}
```

### Follow-Up Questions

- When do you favor spies vs pure mocks?
- How do you avoid brittle `verifyNoMoreInteractions` expectations?
- What patterns manage static method mocking responsibly?

---

## 5. Testing REST APIs (MockMvc, WebTestClient)

### Concept Brief

MockMvc (servlet stack) and WebTestClient (reactive stack) simulate HTTP requests without booting the full server, integrating seamlessly with Spring Security.

### Why It Matters

- **Speed**: Rapid feedback for Bhopal REST contracts.
- **Coverage**: Validate headers, JSON, authentication flows.
- **Confidence**: Document APIs with REST Docs/OpenAPI.

### Practical Walkthrough

```java
@WebMvcTest(controllers = OrderController.class)
class OrderControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockBean private OrderService orderService;

    @Test
    void shouldReturnOrderDetails() throws Exception {
        when(orderService.getOrder("ORD-123"))
            .thenReturn(new OrderDto("ORD-123", "Bhopal", OrderStatus.CONFIRMED));

        mockMvc.perform(get("/bhopal/orders/ORD-123")
                .header("X-Bhopal-Correlation", "abc-123"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.orderId").value("ORD-123"))
            .andExpect(jsonPath("$.region").value("Bhopal"));
    }
}
```

### Follow-Up Questions

- How do you integrate REST Docs or SpringDoc for API documentation?
- When do you prefer full `@SpringBootTest` over slice tests?
- How do you emulate security filters (`@WithMockUser`, JWT mocks)?

---

## 6. Integration Testing with Testcontainers

### Concept Brief

Testcontainers orchestrates disposable Docker environments (PostgreSQL, Kafka, Redis) for realistic integration tests.

### Why It Matters

- **Realism**: Verify Bhopal workflows against real dependencies.
- **Portability**: Same setup on laptops and CI.
- **Isolation**: Clean environment per suite.

### Practical Walkthrough

```java
@Testcontainers
@SpringBootTest
class OrderRepositoryIT {

    @Container
    static PostgreSQLContainer<?> postgres =
        new PostgreSQLContainer<>("postgres:14")
            .withDatabaseName("bhopal")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired private OrderRepository repository;
}
```

### Follow-Up Questions

- How do you keep container startup times acceptable in CI?
- When do you share containers across classes vs per test?
- How do you capture container logs and metrics for debugging?

---

## 7. Database Testing (H2, Embedded DBs)

### Concept Brief

Embedded databases (H2, HSQLDB) provide lightweight persistence for repository tests. Configure them to mimic production dialects for accuracy.

### Why It Matters

- **Speed**: Millisecond tests without Docker overhead.
- **Coverage**: Validate JPA/Hibernate mappings early.
- **Fallback**: Useful when containers are costly or unavailable.

### Practical Walkthrough

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:bhopal;MODE=PostgreSQL;DATABASE_TO_UPPER=false
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

### Follow-Up Questions

- When do you move from H2 to Testcontainers despite slower tests?
- How do you emulate PostgreSQL features (JSONB, enum types) locally?
- How do you seed reference data consistently across suites?

---

## 8. Test Lifecycle, Fixtures & Data Initialization

### Concept Brief

Lifecycle callbacks (`@BeforeAll`, `@BeforeEach`, `@AfterEach`, `@AfterAll`) manage setup/cleanup. Builders and factories keep fixtures expressive and DRY.

### Why It Matters

- **Isolation**: Prevent state bleeding between cases.
- **Clarity**: Fixtures communicate business scenarios.
- **Performance**: Avoid unnecessary context reloads.

### Practical Walkthrough

```java
class OrderServiceTest {

    private OrderService orderService;
    private InMemoryOrderRepository repository;

    @BeforeEach
    void init() {
        repository = new InMemoryOrderRepository();
        orderService = new OrderService(repository);
    }

    @AfterEach
    void tearDown() {
        repository.clear();
    }
}
```

### Follow-Up Questions

- When do you mark tests with `@DirtiesContext`?
- How do you centralize fixture builders for cross-team reuse?
- What patterns manage time-dependent tests (Clock injection, `@TimeZone`)?

---

## 9. Property-Based Testing & Data Generation

### Concept Brief

Property-based testing (JUnit QuickCheck, jqwik) generates many inputs to validate invariants beyond fixed examples.

### Why It Matters

- **Coverage**: Discover edge cases in Bhopal pricing rules.
- **Resilience**: Guard against regressions introduced by rare data.
- **Automation**: Less manual data curation.

### Practical Walkthrough

```java
@Property(tries = 100)
void loyaltyPointsNeverNegative(@ForAll @IntRange(min = 0, max = 10000) int earned,
                                @ForAll @IntRange(min = 0, max = 10000) int redeemed) {
    LoyaltyWallet wallet = new LoyaltyWallet();
    wallet.earn(earned);
    wallet.redeem(Math.min(earned, redeemed));

    Assertions.assertThat(wallet.points()).isGreaterThanOrEqualTo(0);
}
```

### Follow-Up Questions

- When do you adopt property-based testing over example-based tests?
- How do you control generators to stay business-relevant?
- What tooling integrates property-based tests into Maven/Gradle builds?

---

## 10. Mutation Testing (PIT) & Coverage Improvement

### Concept Brief

Mutation testing mutates bytecode to ensure tests catch behavioral changes. Survivors highlight weak assertions.

### Why It Matters

- **Quality**: Proves tests guard behavior, not just lines.
- **Focus**: Directs effort to gaps in Bhopal-critical modules.
- **Governance**: Mutation thresholds support quality gates.

### Practical Walkthrough

```xml
<plugin>
  <groupId>org.pitest</groupId>
  <artifactId>pitest-maven</artifactId>
  <version>1.15.0</version>
  <configuration>
    <targetClasses>
      <param>com.bhopal.loyalty.*</param>
    </targetClasses>
    <targetTests>
      <param>com.bhopal.loyalty.*Test</param>
    </targetTests>
    <mutationThreshold>80</mutationThreshold>
  </configuration>
</plugin>
```

### Follow-Up Questions

- How do you balance mutation thresholds with pipeline runtime?
- When is it acceptable to exclude classes from mutation testing?
- How do you surface mutation results to reviewers?

---

## 11. Asynchronous & Concurrent Testing

### Concept Brief

Testing async flows requires utilities (`CompletableFuture`, Reactor `StepVerifier`, Awaitility) and concurrency testing (JcStress, Thread Weaver).

### Why It Matters

- **Reliability**: Validate Bhopal async pipelines without flakiness.
- **Determinism**: Awaitility/timeouts prevent indefinite waits.
- **Safety**: Detect race conditions early.

### Practical Walkthrough

```java
@Test
void shouldCompleteAsyncJob() {
    CompletableFuture<String> future = service.runAsyncJob("Bhopal");

    Awaitility.await()
        .atMost(Duration.ofSeconds(5))
        .untilAsserted(() -> assertThat(future).isCompletedWithValue("SUCCESS"));
}
```

### Follow-Up Questions

- How do you test Reactor/Flux pipelines deterministically?
- When do you employ stress tools (JcStress) for concurrency issues?
- How do you control time in tests (virtual clocks, `TestScheduler`)?

---

## 12. Test Data Management & Synthetic Fixtures

### Concept Brief

Manage test data via builders, object mothers, factory functions, or synthetic data generators. Keep fixtures readable, reusable, and compliant.

### Why It Matters

- **Maintainability**: Avoid copy-paste data across suites.
- **Compliance**: Synthetic data protects PII for Bhopal tenants.
- **Reusability**: Shared libraries accelerate new tests.

### Practical Walkthrough

```java
public final class TestDataFactory {

    public static OrderBuilder bhopalOrder() {
        return OrderBuilder.anOrder()
            .withRegion("Bhopal")
            .withStatus(OrderStatus.PENDING)
            .withCustomerId(UUID.randomUUID());
    }
}
```

### Follow-Up Questions

- How do you centralize fixtures across microservices?
- When do you prefer JSON templates to Java builders?
- How do you anonymize production data for staging tests?

---

## 13. CI/CD Integration & Quality Gates

### Concept Brief

Pipelines execute unit/integration tests, evaluate coverage, enforce mutation thresholds, and block merges when quality drops.

### Why It Matters

- **Consistency**: Every Bhopal merge runs identical gates.
- **Visibility**: Coverage dashboards highlight blind spots.
- **Guardrails**: Auto-block merges on regressions.

### Practical Walkthrough

```groovy
pipeline {
  agent any
  stages {
    stage('Test') {
      steps { sh 'mvn clean verify -Pbhopal' }
    }
    stage('Mutation') {
      steps { sh 'mvn org.pitest:pitest-maven:mutationCoverage' }
    }
    stage('Quality Gate') {
      steps {
        timeout(time: 2, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }
  }
}
```

### Follow-Up Questions

- How do you split slow suites to keep pipelines under a target duration?
- What coverage/mutation thresholds do you enforce per module?
- How do you quarantine and fix flaky tests detected in CI?

---

## 14. Contract Testing & Consumer-Driven Contracts

### Concept Brief

Consumer-driven contracts (Pact, Spring Cloud Contract) ensure service providers honor consumer expectations without full integration environments.

### Why It Matters

- **Alignment**: Bhopal client teams evolve safely.
- **Speed**: Fail fast when contracts drift.
- **Confidence**: Reduce reliance on brittle E2E environments.

### Practical Walkthrough

```groovy
// Pact consumer test
given("Order exists")
  .uponReceiving("retrieve order")
  .path("/orders/ORD-123")
  .method("GET")
  .willRespondWith()
  .status(200)
  .body(newJsonObject { "orderId" to "ORD-123" })
```

### Follow-Up Questions

- How do you automate contract verification in CI/CD?
- When do you prefer schema validation over CDC?
- How do you handle versioning and backward compatibility in contracts?

---

## 15. Best Practices for Readable & Reliable Tests

### Concept Brief

Adopt naming conventions, Given-When-Then structure, minimal assertions per test, and deterministic behavior for maintainable suites.

### Why It Matters

- **Team Alignment**: Shared patterns across Bhopal squads.
- **Onboarding**: New engineers grok intent quickly.
- **Maintainability**: Reduce brittle assertions during refactors.

### Practical Walkthrough

```java
@DisplayName("Given a Bhopal customer when placing order then reserves inventory")
class OrderPlacementTest {

    @Test
    void shouldReserveInventory() {
        // Given
        Order order = TestDataFactory.bhopalOrder().build();

        // When
        OrderConfirmation confirmation = orderService.place(order);

        // Then
        assertThat(confirmation.status()).isEqualTo(OrderStatus.CONFIRMED);
        verify(inventoryClient).reserve(order.getId());
    }
}
```

### Follow-Up Questions

- How do you enforce naming and structure guidelines automatically?
- When do you refactor tests alongside production changes?
- How do you measure and limit test runtime per suite?

---

### Quick References

- **JUnit essentials**: `@ExtendWith`, `@TestInstance`, dynamic tests, parallel execution.
- **Assertions**: Prefer AssertJ/JSON assertions, craft custom matchers.
- **Mockito**: Enable strict stubs, use captors wisely, avoid over-mocking.
- **REST tests**: Slice with MockMvc/WebTestClient, document with REST Docs.
- **Containers**: Reuse persistent containers, leverage networks for multi-service tests.
- **Data**: Centralize builders, anonymize PII, leverage property-based generators.
- **Mutation**: Schedule nightly runs, track thresholds, report survivors.
- **Async tests**: Use Awaitility, StepVerifier, virtual schedulers for determinism.
- **Contracts**: Automate Pact/SC-Contract verification pre-deploy.
- **Pipelines**: Parallelize suites, quarantine flaky tests, integrate quality gates.

This concludes the expanded JUnit & Mockito interview pack tailored for Bhopal services.\*\*\*
