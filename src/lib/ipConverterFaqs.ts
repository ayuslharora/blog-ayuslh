export const FAQS = [
  {
    question: "What is an IPv4 address in binary?",
    answer:
      "An IPv4 address like 192.168.1.4 is really four 8-bit numbers (octets) joined by dots. Written in binary, each octet becomes 8 bits, so the full address is 32 bits long: 11000000.10101000.00000001.00000100.",
  },
  {
    question: "Why convert an IP address to binary?",
    answer:
      "Binary is how computers and routers actually store and compare IP addresses. Seeing the binary form makes concepts like subnet masks, CIDR notation, and network/host boundaries far easier to reason about than the decimal form alone.",
  },
  {
    question: "What is dotted quad notation?",
    answer:
      'Dotted quad notation is the a.b.c.d format most people know as "an IP address" - four decimal numbers from 0-255, separated by dots. It exists purely for human readability; the underlying address is always 32 bits of binary.',
  },
  {
    question: "How many bits are in an IPv4 address?",
    answer:
      "Exactly 32 bits, split into four 8-bit octets (4 x 8 = 32). That fixed length is why IPv4 tops out at about 4.3 billion unique addresses, which is also why IPv6 exists.",
  },
];
